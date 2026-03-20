import { Player } from '../../domain/entities/player.js';
import { db } from '../db/database.js';

export class SqlitePlayerRepository {
  create(name, nowIso, initialElo = 1200) {
    const statement = db.prepare('INSERT INTO players (name, elo, games_played, created_at) VALUES (?, ?, ?, ?)');
    const result = statement.run(name, initialElo, 0, nowIso);
    return Player.createNew(Number(result.lastInsertRowid), name, nowIso, initialElo);
  }

  findById(id) {
    const statement = db.prepare('SELECT * FROM players WHERE id = ?');
    const row = statement.get(id);
    return row ? this.#mapRow(row) : null;
  }

  update(player) {
    const data = player.toJSON();
    db.prepare('UPDATE players SET name = ?, elo = ?, games_played = ?, created_at = ? WHERE id = ?').run(
      data.name,
      data.elo,
      data.gamesPlayed,
      data.createdAt,
      data.id,
    );
    return player;
  }

  #mapRow(row) {
    return new Player({
      id: row.id,
      name: row.name,
      elo: row.elo,
      gamesPlayed: row.games_played,
      createdAt: row.created_at,
    });
  }
}
