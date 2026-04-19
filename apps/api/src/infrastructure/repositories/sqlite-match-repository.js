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

  getMetrics(algorithm) {
    const store = readStore();
    const entries = store.algorithmMetrics.filter((row) => row.algorithm === algorithm);

    if (entries.length === 0) {
      return {
        algorithm,
        avgWaitTime: 0,
        avgRatingDiff: 0,
        avgComputeTime: 0,
        matchesPlayed: 0,
      };
    }

    const total = entries.reduce((acc, entry) => {
      acc.wait += entry.waitTimeSeconds;
      acc.diff += entry.ratingDiff;
      acc.compute += entry.computeTimeMs;
      return acc;
    }, { wait: 0, diff: 0, compute: 0 });

    return {
      algorithm,
      avgWaitTime: total.wait / entries.length,
      avgRatingDiff: total.diff / entries.length,
      avgComputeTime: total.compute / entries.length,
      matchesPlayed: entries.length,
    };
  }
}
