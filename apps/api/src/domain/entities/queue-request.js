export class QueueRequest {
  constructor({ id, playerId, ratingSnapshot, createdAt, timeControl }) {
    this.id = id;
    this.playerId = playerId;
    this.ratingSnapshot = ratingSnapshot;
    this.createdAt = createdAt;
    this.timeControl = timeControl;
  }

  toJSON() {
    return {
      id: this.id,
      playerId: this.playerId,
      ratingSnapshot: this.ratingSnapshot,
      createdAt: this.createdAt,
      timeControl: this.timeControl,
    };
  }
}
