import { QueueRequest } from '../../domain/entities/queue-request.js';
import { db } from '../db/database.js';

export class SqliteQueueRepository {
  enqueue(playerId, ratingSnapshot, nowIso, timeControl = 'rapid') {
    const existing = this.findByPlayerId(playerId);
    if (existing) return existing;

    const result = db.prepare(
      'INSERT INTO queue_requests (player_id, rating_snapshot, created_at, time_control) VALUES (?, ?, ?, ?)',
    ).run(playerId, ratingSnapshot, nowIso, timeControl);

    return new QueueRequest({
      id: Number(result.lastInsertRowid),
      playerId,
      ratingSnapshot,
      createdAt: nowIso,
      timeControl,
    });
  }

  findByPlayerId(playerId) {
    const row = db.prepare('SELECT * FROM queue_requests WHERE player_id = ?').get(playerId);
    return row ? this.#mapRow(row) : null;
  }

  getAll() {
    const rows = db.prepare('SELECT * FROM queue_requests ORDER BY created_at ASC').all();
    return rows.map((row) => this.#mapRow(row));
  }

  removeMany(ids) {
    const statement = db.prepare('DELETE FROM queue_requests WHERE id = ?');
    for (const id of ids) statement.run(id);
  }

  #mapRow(row) {
    return new QueueRequest({
      id: row.id,
      playerId: row.player_id,
      ratingSnapshot: row.rating_snapshot,
      createdAt: row.created_at,
      timeControl: row.time_control,
    });
  }
}
