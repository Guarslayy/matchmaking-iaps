import { QueueRequest } from '../../domain/entities/queue-request.js';
import { nextId, readStore, updateStore } from '../db/database.js';

export class SqliteQueueRepository {
  enqueue(playerId, ratingSnapshot, nowIso, timeControl = 'rapid') {
    return updateStore((store) => {
      const existing = store.queueRequests.find((request) => request.playerId === playerId);
      if (existing) {
        return new QueueRequest(existing);
      }

      const request = {
        id: nextId(store, 'queueRequests'),
        playerId,
        ratingSnapshot,
        createdAt: nowIso,
        timeControl,
      };
      store.queueRequests.push(request);
      return new QueueRequest(request);
    });
  }

  findByPlayerId(playerId) {
    const store = readStore();
    const row = store.queueRequests.find((request) => request.playerId === playerId);
    return row ? new QueueRequest(row) : null;
  }

  getAll() {
    const store = readStore();
    return store.queueRequests
      .slice()
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .map((row) => new QueueRequest(row));
  }

  removeMany(ids) {
    updateStore((store) => {
      store.queueRequests = store.queueRequests.filter((request) => !ids.includes(request.id));
      return null;
    });
  }
}
