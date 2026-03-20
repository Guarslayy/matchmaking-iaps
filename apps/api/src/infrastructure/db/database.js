import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.resolve(process.cwd(), 'apps/api/data');
const databasePath = path.join(dataDir, 'matchmaking.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(databasePath);
db.exec('PRAGMA journal_mode = WAL;');
