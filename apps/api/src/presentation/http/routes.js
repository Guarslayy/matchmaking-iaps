import { algorithmTypes } from '../../../../../packages/shared/src/types.js';

function isAlgorithmType(value) {
  return algorithmTypes.includes(value);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

function parseJsonBody(req) {
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

export async function handleHttpRequest(req, res, deps) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method ?? 'GET';

  if (method === 'GET' && pathname === '/') {
    sendJson(res, 200, { message: 'API is running' });
    return;
  }

  if (method === 'POST' && pathname === '/players') {
    try {
      const body = await parseJsonBody(req);
      if (!body.name || !String(body.name).trim()) {
        sendJson(res, 400, { message: 'name is required' });
        return;
      }
      const player = deps.registerPlayer.execute(String(body.name).trim(), new Date().toISOString());
      sendJson(res, 201, player);
      return;
    } catch {
      sendJson(res, 400, { message: 'invalid json body' });
      return;
    }
  }

  const playerMatch = pathname.match(/^\/players\/(\d+)$/);
  if (method === 'GET' && playerMatch) {
    const playerId = Number(playerMatch[1]);
    const player = deps.getPlayerProfile.execute(playerId);
    if (!player) {
      sendJson(res, 404, { message: 'player not found' });
      return;
    }
    sendJson(res, 200, player);
    return;
  }

  const historyMatch = pathname.match(/^\/players\/(\d+)\/history$/);
  if (method === 'GET' && historyMatch) {
    const playerId = Number(historyMatch[1]);
    const player = deps.getPlayerProfile.execute(playerId);
    if (!player) {
      sendJson(res, 404, { message: 'player not found' });
      return;
    }
    sendJson(res, 200, deps.getPlayerHistory.execute(playerId));
    return;
  }

  if (method === 'POST' && pathname === '/match/find') {
    try {
      const body = await parseJsonBody(req);
      if (typeof body.playerId !== 'number') {
        sendJson(res, 400, { message: 'playerId is required' });
        return;
      }
      const algorithm = body.algorithm ?? 'baseline';
      if (!isAlgorithmType(algorithm)) {
        sendJson(res, 400, { message: 'unknown algorithm' });
        return;
      }
      const result = deps.runMatchmaking.execute(body.playerId, algorithm, new Date().toISOString());
      if (result.message === 'waiting') {
        sendJson(res, 202, result);
        return;
      }
      sendJson(res, 200, result);
      return;
    } catch (error) {
      if (error instanceof Error && error.message === 'Player not found') {
        sendJson(res, 404, { message: 'player not found' });
        return;
      }
      sendJson(res, 400, { message: 'invalid json body' });
      return;
    }
  }

  if (method === 'GET' && pathname === '/metrics') {
    const algorithm = url.searchParams.get('algorithm');
    if (!algorithm || !isAlgorithmType(algorithm)) {
      sendJson(res, 400, { message: 'algorithm query param is required and must be valid' });
      return;
    }
    sendJson(res, 200, deps.getMetrics.execute(algorithm));
    return;
  }

  sendJson(res, 404, { message: 'route not found' });
}
