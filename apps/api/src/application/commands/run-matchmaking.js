import { BaselineMatchmakingAlgorithm } from '../../domain/matchmaking/baseline.js';
import { GreedyMatchmakingAlgorithm } from '../../domain/matchmaking/greedy.js';
import { BatchLiteMatchmakingAlgorithm } from '../../domain/matchmaking/batch-lite.js';

const algorithms = {
  baseline: new BaselineMatchmakingAlgorithm(),
  greedy: new GreedyMatchmakingAlgorithm(),
  batch_lite: new BatchLiteMatchmakingAlgorithm(),
};

export class RunMatchmakingCommand {
  constructor(playerRepository, queueRepository, completeMatch) {
    this.playerRepository = playerRepository;
    this.queueRepository = queueRepository;
    this.completeMatch = completeMatch;
  }

  execute(playerId, algorithm, nowIso) {
    const player = this.playerRepository.findById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    this.queueRepository.enqueue(player.id, player.elo, nowIso);
    const queue = this.queueRepository.getAll();
    const startedAt = performance.now();
    const candidate = algorithms[algorithm].findPair(queue, nowIso);
    const computeTimeMs = Number((performance.now() - startedAt).toFixed(2));

    if (!candidate) {
      return { message: 'waiting' };
    }

    this.queueRepository.removeMany([candidate.left.id, candidate.right.id]);
    return this.completeMatch.execute(candidate, nowIso, computeTimeMs);
  }
}
