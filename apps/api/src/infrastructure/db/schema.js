import { db } from './database.js';

export function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      elo INTEGER NOT NULL,
      games_played INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      opponent_id INTEGER NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('win', 'lose')),
      elo_before INTEGER NOT NULL,
      elo_after INTEGER NOT NULL,
      opponent_elo INTEGER NOT NULL,
      color TEXT NOT NULL CHECK(color IN ('white', 'black')),
      algorithm_used TEXT NOT NULL CHECK(algorithm_used IN ('baseline', 'greedy', 'batch_lite')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS queue_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL UNIQUE,
      rating_snapshot INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      time_control TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS algorithm_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      algorithm TEXT NOT NULL CHECK(algorithm IN ('baseline', 'greedy', 'batch_lite')),
      wait_time_seconds INTEGER NOT NULL,
      rating_diff INTEGER NOT NULL,
      compute_time_ms REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}
