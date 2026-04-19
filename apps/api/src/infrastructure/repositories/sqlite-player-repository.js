import { Player } from '../../domain/entities/player.js';
import { nextId, readStore, updateStore } from '../db/database.js';

export class SqlitePlayerRepository {
  create(name, nowIso, initialElo = 1200) {
    return updateStore((store) => {
      const player = {
        id: nextId(store, 'players'),
        name,
        elo: initialElo,
        gamesPlayed: 0,
        createdAt: nowIso,
      };
      store.players.push(player);
      return new Player(player);
    });
  }

  findById(id) {
    const store = readStore();
    const row = store.players.find((player) => player.id === id);
    return row ? new Player(row) : null;
  }

  update(player) {
    return updateStore((store) => {
      const data = player.toJSON();
      const index = store.players.findIndex((entry) => entry.id === data.id);
      if (index === -1) {
        throw new Error(`Player ${data.id} not found`);
      }
      store.players[index] = data;
      return new Player(data);
    });
  }
}
