import {
  isAlgorithmType,
  parseJsonBody,
  readAlgorithmBody,
  readNumericQueryParam,
  sendJson,
} from './http-utils.js';

function sendError(res, status, message) {
  sendJson(res, status, { message });
}

async function createPlayer(req, res, deps) {
  try {
    const body = await parseJsonBody(req);
    const name = String(body.name ?? '').trim();
    if (!name) {
      sendError(res, 400, 'name is required');
      return;
    }

    const initialElo = typeof body.initialElo === 'number' ? body.initialElo : 1200;
    sendJson(res, 201, deps.registerPlayer.execute(name, new Date().toISOString(), initialElo));
  } catch {
    sendError(res, 400, 'invalid json body');
  }
}

async function findMatch(req, res, deps) {
  try {
    const body = await parseJsonBody(req);
    if (typeof body.playerId !== 'number') {
      sendError(res, 400, 'playerId is required');
      return;
    }

    const { algorithm, options } = readAlgorithmBody(body);
    const result = deps.runMatchmaking.execute(body.playerId, algorithm, new Date().toISOString(), options);
    sendJson(res, result.message === 'waiting' ? 202 : 200, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Player not found') {
      sendError(res, 404, 'player not found');
      return;
    }

    sendError(res, 400, error instanceof Error ? error.message : 'invalid json body');
  }
}

async function runSimulationRound(req, res, deps) {
  try {
    const body = await parseJsonBody(req);
    const { algorithm, options } = readAlgorithmBody(body, 'hybrid_weighted');
    const round = deps.runSimulationRound.execute(algorithm, new Date().toISOString(), options);
    sendJson(res, 201, round);
  } catch (error) {
    sendError(res, 400, error instanceof Error ? error.message : 'invalid json body');
  }
}

function getPlayer(req, res, deps, playerId) {
  const player = deps.getPlayerProfile.execute(playerId);
  if (!player) {
    sendError(res, 404, 'player not found');
    return;
  }

  sendJson(res, 200, player);
}

function getPlayerHistory(req, res, deps, playerId) {
  const player = deps.getPlayerProfile.execute(playerId);
  if (!player) {
    sendError(res, 404, 'player not found');
    return;
  }

  sendJson(res, 200, deps.getPlayerHistory.execute(playerId));
}

function getMetrics(reqUrl, res, deps) {
  const algorithm = reqUrl.searchParams.get('algorithm');
  if (!algorithm || !isAlgorithmType(algorithm)) {
    sendError(res, 400, 'algorithm query param is required and must be valid');
    return;
  }

  sendJson(res, 200, deps.getMetrics.execute(algorithm));
}

export async function handleHttpRequest(req, res, deps) {
  const reqUrl = new URL(req.url, 'http://localhost');
  const pathname = reqUrl.pathname;
  const method = req.method ?? 'GET';

  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (method === 'GET' && pathname === '/') {
    sendJson(res, 200, { message: 'API is running' });
    return;
  }

  if (method === 'GET' && pathname === '/players') {
    sendJson(res, 200, deps.listPlayers.execute());
    return;
  }

  if (method === 'POST' && pathname === '/players') {
    await createPlayer(req, res, deps);
    return;
  }

  const playerMatch = pathname.match(/^\/players\/(\d+)$/);
  if (method === 'GET' && playerMatch) {
    getPlayer(req, res, deps, Number(playerMatch[1]));
    return;
  }

  const historyMatch = pathname.match(/^\/players\/(\d+)\/history$/);
  if (method === 'GET' && historyMatch) {
    getPlayerHistory(req, res, deps, Number(historyMatch[1]));
    return;
  }

  if (method === 'POST' && pathname === '/match/find') {
    await findMatch(req, res, deps);
    return;
  }

  if (method === 'GET' && pathname === '/metrics') {
    getMetrics(reqUrl, res, deps);
    return;
  }

  if (method === 'POST' && pathname === '/demo/reset') {
    deps.resetDemoData();
    sendJson(res, 200, { message: 'demo data reset' });
    return;
  }

  if (method === 'POST' && pathname === '/demo/seed') {
    sendJson(res, 201, deps.seedDemoData.execute());
    return;
  }

  if (method === 'POST' && pathname === '/simulation/round') {
    await runSimulationRound(req, res, deps);
    return;
  }

  if (method === 'POST' && pathname === '/simulation/compare') {
    sendJson(res, 201, deps.compareAlgorithms.execute());
    return;
  }

  if (method === 'GET' && pathname === '/simulation/rounds') {
    const limit = readNumericQueryParam(reqUrl.searchParams, 'limit', 12);
    sendJson(res, 200, deps.listSimulationRounds.execute(limit));
    return;
  }

  sendError(res, 404, 'route not found');
}
