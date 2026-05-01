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
    simulationRounds: 0,
  },
  players: [],
  matches: [],
  queueRequests: [],
  algorithmMetrics: [],
  simulationRounds: [],
};

function createEmptyStore() {
  return JSON.parse(JSON.stringify(emptyStore));
}

function normalizeStore(store) {
  const normalized = { ...createEmptyStore(), ...store };
  normalized.counters = { ...emptyStore.counters, ...(store.counters ?? {}) };

  for (const key of ['players', 'matches', 'queueRequests', 'algorithmMetrics', 'simulationRounds']) {
    if (!Array.isArray(normalized[key])) {
      normalized[key] = [];
    }
  }

  return normalized;
}

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(createEmptyStore(), null, 2));
  }
}

export function getDataFilePath() {
  ensureStoreFile();
  return dataFilePath;
}

export function readStore() {
  ensureStoreFile();
  return normalizeStore(JSON.parse(fs.readFileSync(dataFilePath, 'utf8')));
}

export function writeStore(store) {
  ensureStoreFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(normalizeStore(store), null, 2));
}

export function resetStore() {
  writeStore(createEmptyStore());
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
