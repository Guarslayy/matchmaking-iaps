export class RandomResultResolver {
  resolve(playerAId, playerBId) {
    return Math.random() >= 0.5
      ? { winnerPlayerId: playerAId, loserPlayerId: playerBId }
      : { winnerPlayerId: playerBId, loserPlayerId: playerAId };
  }
}
