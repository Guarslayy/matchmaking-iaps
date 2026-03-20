export class Player {
  constructor({ id, name, elo, gamesPlayed, createdAt }) {
    this.id = id;
    this.name = name;
    this.elo = elo;
    this.gamesPlayed = gamesPlayed;
    this.createdAt = createdAt;
  }

  static createNew(id, name, createdAt, initialElo = 1200) {
    return new Player({ id, name, elo: initialElo, gamesPlayed: 0, createdAt });
  }

  recordGame(newElo) {
    return new Player({
      id: this.id,
      name: this.name,
      elo: newElo,
      gamesPlayed: this.gamesPlayed + 1,
      createdAt: this.createdAt,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      elo: this.elo,
      gamesPlayed: this.gamesPlayed,
      createdAt: this.createdAt,
    };
  }
}
