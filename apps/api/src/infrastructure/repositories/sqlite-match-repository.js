import { Match } from '../../domain/entities/match.js';
import { db } from '../db/database.js';

export class SqliteMatchRepository {
  save(match) {
    const data = match.toJSON();
    const result = db.prepare(`
      INSERT INTO matches (
        player_id, opponent_id, result, elo_before, elo_after, opponent_elo, color, algorithm_used, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.playerId,
      data.opponentId,
      data.result,
      data.eloBefore,
      data.eloAfter,
      data.opponentElo,
      data.color,
      data.algorithmUsed,
      data.createdAt,
    );

    return new Match({ ...data, id: Number(result.lastInsertRowid) });
  }

  findByPlayerId(playerId) {
    const rows = db.prepare('SELECT * FROM matches WHERE player_id = ? ORDER BY created_at DESC, id DESC').all(playerId);
    return rows.map((row) => new Match({
      id: row.id,
      playerId: row.player_id,
      opponentId: row.opponent_id,
      result: row.result,
      eloBefore: row.elo_before,
      eloAfter: row.elo_after,
      opponentElo: row.opponent_elo,
      color: row.color,
      algorithmUsed: row.algorithm_used,
      createdAt: row.created_at,
    }));
  }

  recordMetric(algorithm, waitTimeSeconds, ratingDiff, computeTimeMs, nowIso) {
    db.prepare(
      'INSERT INTO algorithm_metrics (algorithm, wait_time_seconds, rating_diff, compute_time_ms, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run(algorithm, waitTimeSeconds, ratingDiff, computeTimeMs, nowIso);
  }

  getMetrics(algorithm) {
    const row = db.prepare(`
      SELECT
        AVG(wait_time_seconds) AS avg_wait_time,
        AVG(rating_diff) AS avg_rating_diff,
        AVG(compute_time_ms) AS avg_compute_time,
        COUNT(*) AS matches_played
      FROM algorithm_metrics
      WHERE algorithm = ?
    `).get(algorithm);

    return {
      algorithm,
      avgWaitTime: Number(row.avg_wait_time ?? 0),
      avgRatingDiff: Number(row.avg_rating_diff ?? 0),
      avgComputeTime: Number(row.avg_compute_time ?? 0),
      matchesPlayed: Number(row.matches_played ?? 0),
    };
  }
}
