import { algorithmTypes } from '../../../../../packages/shared/src/types.js';

export function isAlgorithmType(value) {
  return algorithmTypes.includes(value);
}

export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

export function readHybridOptions(body, defaults = { alpha: 0.7, beta: 0.3 }) {
  if (body.alpha !== undefined && typeof body.alpha !== 'number') {
    throw new Error('alpha must be a number');
  }

  if (body.beta !== undefined && typeof body.beta !== 'number') {
    throw new Error('beta must be a number');
  }

  return {
    alpha: body.alpha ?? defaults.alpha,
    beta: body.beta ?? defaults.beta,
  };
}

export function readAlgorithmBody(body, fallback = 'baseline') {
  const algorithm = body.algorithm ?? fallback;
  if (!isAlgorithmType(algorithm)) {
    throw new Error('unknown algorithm');
  }

  return {
    algorithm,
    options: algorithm === 'hybrid_weighted' ? readHybridOptions(body) : {},
  };
}

export function readNumericQueryParam(searchParams, name, fallback) {
  const value = Number(searchParams.get(name) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}
