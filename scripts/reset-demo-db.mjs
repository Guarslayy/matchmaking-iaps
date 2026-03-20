import fs from 'node:fs';
import path from 'node:path';

const dbDir = path.resolve(process.cwd(), 'apps/api/data');
const files = ['matchmaking.db', 'matchmaking.db-shm', 'matchmaking.db-wal'];

if (!fs.existsSync(dbDir)) {
  console.log(`Database directory does not exist yet: ${dbDir}`);
  process.exit(0);
}

for (const file of files) {
  const fullPath = path.join(dbDir, file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Removed ${fullPath}`);
  }
}
