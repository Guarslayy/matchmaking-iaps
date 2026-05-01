import { BaselineMatchmakingAlgorithm } from '../../domain/matchmaking/baseline.js';
import { GreedyMatchmakingAlgorithm } from '../../domain/matchmaking/greedy.js';
import { BatchLiteMatchmakingAlgorithm } from '../../domain/matchmaking/batch-lite.js';
import { HybridWeightedMatchmakingAlgorithm } from '../../domain/matchmaking/hybrid-weighted.js';
import { toPlayerDTO } from '../dto/mappers.js';

const algorithms = {
  baseline: new BaselineMatchmakingAlgorithm(),
  greedy: new GreedyMatchmakingAlgorithm(),
  batch_lite: new BatchLiteMatchmakingAlgorithm(),
  hybrid_weighted: new HybridWeightedMatchmakingAlgorithm(),
};

function roundNumber(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function buildRoundMetrics(playersCount, pairs, unmatchedPlayers, totalComputeTimeMs) {
  const avg = (values) => (values.length === 0 ? 0 : values.reduce((acc, value) => acc + value, 0) / values.length);
  const ratingDiffs = pairs.map((pair) => pair.ratingDiff);
  const waitTimes = pairs.map((pair) => pair.waitTimeSeconds);
  const matchRate = playersCount === 0 ? 0 : (pairs.length * 2) / playersCount;
  const avgRatingDiff = avg(ratingDiffs);
  const avgWaitTime = avg(waitTimes);
  const ratingQuality = Math.max(0, 1 - avgRatingDiff / 400);
  const waitQuality = Math.max(0, 1 - avgWaitTime / 180);
  const qualityScore = Math.round((matchRate * 0.4 + ratingQuality * 0.4 + waitQuality * 0.2) * 100);

  return {
    playersCount,
    pairsCount: pairs.length,
    matchedPlayers: pairs.length * 2,
    unmatchedPlayers: unmatchedPlayers.length,
    matchRate: roundNumber(matchRate),
    avgRatingDiff: roundNumber(avgRatingDiff),
    minRatingDiff: ratingDiffs.length ? Math.min(...ratingDiffs) : 0,
    maxRatingDiff: ratingDiffs.length ? Math.max(...ratingDiffs) : 0,
    avgWaitTime: roundNumber(avgWaitTime),
    minWaitTime: waitTimes.length ? Math.min(...waitTimes) : 0,
    maxWaitTime: waitTimes.length ? Math.max(...waitTimes) : 0,
    totalComputeTimeMs: roundNumber(totalComputeTimeMs),
    avgComputeTimeMs: pairs.length ? roundNumber(totalComputeTimeMs / pairs.length, 4) : 0,
    qualityScore,
  };
}

export class RunSimulationRoundCommand {
  constructor(playerRepository, queueRepository, matchRepository, completeMatch) {
    this.playerRepository = playerRepository;
    this.queueRepository = queueRepository;
    this.matchRepository = matchRepository;
    this.completeMatch = completeMatch;
  }

  execute(algorithm, nowIso, options = {}) {
    const matcher = algorithms[algorithm];
    if (!matcher) {
      throw new Error('Unknown algorithm');
    }

    this.queueRepository.clear();
    const players = this.playerRepository.findAll();
    const nowMs = Date.parse(nowIso);

    players.forEach((player, index) => {
      const queuedAt = new Date(nowMs - (players.length - index) * 7000).toISOString();
      this.queueRepository.enqueue(player.id, player.elo, queuedAt);
    });

    const pairs = [];
    let totalComputeTimeMs = 0;

    while (this.queueRepository.getAll().length >= 2) {
      const queue = this.queueRepository.getAll();
      const startedAt = performance.now();
      const candidate = matcher.findPair(queue, nowIso, options);
      const computeTimeMs = Number((performance.now() - startedAt).toFixed(4));
      totalComputeTimeMs += computeTimeMs;

      if (!candidate) {
        break;
      }

      this.queueRepository.removeMany([candidate.left.id, candidate.right.id]);
      const leftBefore = this.playerRepository.findById(candidate.left.playerId);
      const rightBefore = this.playerRepository.findById(candidate.right.playerId);
      const result = this.completeMatch.execute(candidate, nowIso, computeTimeMs);

      pairs.push({
        player: {
          before: toPlayerDTO(leftBefore),
          after: result.player,
        },
        opponent: {
          before: toPlayerDTO(rightBefore),
          after: result.opponent,
        },
        winnerId: result.match.result === 'win' ? result.match.playerId : result.match.opponentId,
        algorithm,
        ratingDiff: candidate.ratingDiff,
        waitTimeSeconds: candidate.estimatedWaitSeconds,
        computeTimeMs,
        debug: candidate.debug ?? null,
      });
    }

    const unmatchedPlayers = this.queueRepository.getAll()
      .map((entry) => this.playerRepository.findById(entry.playerId))
      .filter(Boolean)
      .map(toPlayerDTO);

    this.queueRepository.clear();

    const round = {
      algorithm,
      options,
      createdAt: nowIso,
      metrics: buildRoundMetrics(players.length, pairs, unmatchedPlayers, totalComputeTimeMs),
      pairs,
      unmatchedPlayers,
    };

    return this.matchRepository.recordSimulationRound(round);
  }
}
