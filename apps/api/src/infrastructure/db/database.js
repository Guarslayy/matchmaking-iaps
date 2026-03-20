import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'apps/api/data');
const dataFilePath = path.join(dataDir, 'matchmaking.json');

const emptyStore = {
  counters: {
    players: 0,
    matches: 0,
    queueRequests: 0,
    algorithmMetrics: 0,
  },
  players: [],
  matches: [],
  queueRequests: [],
  algorithmMetrics: [],
};

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(emptyStore, null, 2));
  }
}

export function getDataFilePath() {
  ensureStoreFile();
  return dataFilePath;
}

export function readStore() {
  ensureStoreFile();
  return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

export function writeStore(store) {
  ensureStoreFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2));
}

export function updateStore(mutator) {
  const store = readStore();
  const result = mutator(store);
  writeStore(store);
  return result;
}

export function nextId(store, key) {
  store.counters[key] += 1;
  return store.counters[key];
}
