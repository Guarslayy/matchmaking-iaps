import { createServer } from 'node:http';
import { CompleteMatchCommand } from './application/commands/complete-match.js';
import { RegisterPlayerCommand } from './application/commands/register-player.js';
import { RunMatchmakingCommand } from './application/commands/run-matchmaking.js';
import { GetPlayerHistoryQuery } from './application/queries/get-player-history.js';
import { GetMetricsQuery } from './application/queries/get-metrics.js';
import { GetPlayerProfileQuery } from './application/queries/get-player-profile.js';
import { initializeSchema } from './infrastructure/db/schema.js';
import { SqliteMatchRepository } from './infrastructure/repositories/sqlite-match-repository.js';
import { SqlitePlayerRepository } from './infrastructure/repositories/sqlite-player-repository.js';
import { SqliteQueueRepository } from './infrastructure/repositories/sqlite-queue-repository.js';
import { RandomResultResolver } from './infrastructure/simulation/random-result-resolver.js';
import { handleHttpRequest } from './presentation/http/routes.js';

export function createAppServer() {
  initializeSchema();

  const playerRepository = new SqlitePlayerRepository();
  const queueRepository = new SqliteQueueRepository();
  const matchRepository = new SqliteMatchRepository();
  const resultResolver = new RandomResultResolver();

  const completeMatch = new CompleteMatchCommand(playerRepository, matchRepository, resultResolver);
  const registerPlayer = new RegisterPlayerCommand(playerRepository);
  const runMatchmaking = new RunMatchmakingCommand(playerRepository, queueRepository, completeMatch);
  const getPlayerProfile = new GetPlayerProfileQuery(playerRepository);
  const getPlayerHistory = new GetPlayerHistoryQuery(matchRepository);
  const getMetrics = new GetMetricsQuery(matchRepository);

  const deps = { registerPlayer, runMatchmaking, getPlayerProfile, getPlayerHistory, getMetrics };
  return createServer((req, res) => handleHttpRequest(req, res, deps));
}
