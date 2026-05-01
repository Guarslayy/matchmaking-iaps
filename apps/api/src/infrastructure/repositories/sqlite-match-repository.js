import { Match } from '../../domain/entities/match.js';
import { nextId, readStore, updateStore } from '../db/database.js';

export class SqliteMatchRepository {
  save(match) {
    return updateStore((store) => {
      const data = match.toJSON();
      const saved = { ...data, id: nextId(store, 'matches') };
      store.matches.push(saved);
      return new Match(saved);
    });
  }

  findByPlayerId(playerId) {
    const store = readStore();
    return store.matches
      .filter((row) => row.playerId === playerId)
      .sort((a, b) => {
        const createdAtDiff = Date.parse(b.createdAt) - Date.parse(a.createdAt);
        return createdAtDiff !== 0 ? createdAtDiff : b.id - a.id;
      })
      .map((row) => new Match(row));
  }

  recordMetric(algorithm, waitTimeSeconds, ratingDiff, computeTimeMs, nowIso) {
    updateStore((store) => {
      store.algorithmMetrics.push({
        id: nextId(store, 'algorithmMetrics'),
        algorithm,
        waitTimeSeconds,
        ratingDiff,
        computeTimeMs,
        createdAt: nowIso,
      });
      return null;
    });
  }

  recordSimulationRound(round) {
    return updateStore((store) => {
      const saved = {
        ...round,
        id: nextId(store, 'simulationRounds'),
      };
      store.simulationRounds.push(saved);
      return saved;
    });
  }

  listSimulationRounds(limit = 12) {
    const store = readStore();
    return store.simulationRounds
      .slice()
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id)
      .slice(0, limit);
  }

  getMetrics(algorithm) {
    const store = readStore();
    const entries = store.algorithmMetrics.filter((row) => row.algorithm === algorithm);

    if (entries.length === 0) {
      return {
        algorithm,
        avgWaitTime: 0,
        avgRatingDiff: 0,
        avgComputeTime: 0,
        minWaitTime: 0,
        maxWaitTime: 0,
        minRatingDiff: 0,
        maxRatingDiff: 0,
        matchRate: 0,
        qualityScore: 0,
        matchesPlayed: 0,
      };
    }

    const total = entries.reduce((acc, entry) => {
      acc.wait += entry.waitTimeSeconds;
      acc.diff += entry.ratingDiff;
      acc.compute += entry.computeTimeMs;
      return acc;
    }, { wait: 0, diff: 0, compute: 0 });

    const avgWaitTime = total.wait / entries.length;
    const avgRatingDiff = total.diff / entries.length;
    const avgComputeTime = total.compute / entries.length;
    const ratingDiffs = entries.map((entry) => entry.ratingDiff);
    const waitTimes = entries.map((entry) => entry.waitTimeSeconds);
    const matchRate = 1;
    const ratingQuality = Math.max(0, 1 - avgRatingDiff / 400);
    const waitQuality = Math.max(0, 1 - avgWaitTime / 180);
    const qualityScore = Math.round((matchRate * 0.4 + ratingQuality * 0.4 + waitQuality * 0.2) * 100);

    return {
      algorithm,
      avgWaitTime,
      avgRatingDiff,
      avgComputeTime,
      minWaitTime: Math.min(...waitTimes),
      maxWaitTime: Math.max(...waitTimes),
      minRatingDiff: Math.min(...ratingDiffs),
      maxRatingDiff: Math.max(...ratingDiffs),
      matchRate,
      qualityScore,
      matchesPlayed: entries.length,
    };
  }
}
