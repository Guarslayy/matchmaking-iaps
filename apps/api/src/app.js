import { createServer } from 'node:http';
import { CompareAlgorithmsCommand } from './application/commands/compare-algorithms.js';
import { CompleteMatchCommand } from './application/commands/complete-match.js';
import { RegisterPlayerCommand } from './application/commands/register-player.js';
import { RunMatchmakingCommand } from './application/commands/run-matchmaking.js';
import { RunSimulationRoundCommand } from './application/commands/run-simulation-round.js';
import { SeedDemoDataCommand } from './application/commands/seed-demo-data.js';
import { GetPlayerHistoryQuery } from './application/queries/get-player-history.js';
import { GetMetricsQuery } from './application/queries/get-metrics.js';
import { GetPlayerProfileQuery } from './application/queries/get-player-profile.js';
import { ListPlayersQuery } from './application/queries/list-players.js';
import { ListSimulationRoundsQuery } from './application/queries/list-simulation-rounds.js';
import { initializeSchema } from './infrastructure/db/schema.js';
import { resetStore } from './infrastructure/db/database.js';
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
  const runSimulationRound = new RunSimulationRoundCommand(playerRepository, queueRepository, matchRepository, completeMatch);
  const getPlayerProfile = new GetPlayerProfileQuery(playerRepository);
  const getPlayerHistory = new GetPlayerHistoryQuery(matchRepository);
  const getMetrics = new GetMetricsQuery(matchRepository);
  const listPlayers = new ListPlayersQuery(playerRepository);
  const listSimulationRounds = new ListSimulationRoundsQuery(matchRepository);
  const seedDemoData = new SeedDemoDataCommand(registerPlayer, resetStore);
  const compareAlgorithms = new CompareAlgorithmsCommand(seedDemoData, runSimulationRound, listPlayers);

  const deps = {
    compareAlgorithms,
    registerPlayer,
    resetDemoData: resetStore,
    runMatchmaking,
    runSimulationRound,
    seedDemoData,
    getPlayerProfile,
    getPlayerHistory,
    getMetrics,
    listPlayers,
    listSimulationRounds,
  };
  return createServer((req, res) => handleHttpRequest(req, res, deps));
}
