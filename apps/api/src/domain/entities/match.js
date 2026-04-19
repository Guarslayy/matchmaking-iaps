export class Match {
  constructor({ id, playerId, opponentId, result, eloBefore, eloAfter, opponentElo, color, algorithmUsed, createdAt }) {
    this.id = id;
    this.playerId = playerId;
    this.opponentId = opponentId;
    this.result = result;
    this.eloBefore = eloBefore;
    this.eloAfter = eloAfter;
    this.opponentElo = opponentElo;
    this.color = color;
    this.algorithmUsed = algorithmUsed;
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      playerId: this.playerId,
      opponentId: this.opponentId,
      result: this.result,
      eloBefore: this.eloBefore,
      eloAfter: this.eloAfter,
      opponentElo: this.opponentElo,
      color: this.color,
      algorithmUsed: this.algorithmUsed,
      createdAt: this.createdAt,
    };
  }
}
