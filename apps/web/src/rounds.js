export function latestRoundByAlgorithm(rounds) {
  const map = new Map();
  for (const round of rounds) {
    if (!map.has(round.algorithm)) {
      map.set(round.algorithm, round);
    }
  }
  return map;
}

export function getBestRound(rounds) {
  return rounds.reduce((best, round) => {
    if (!best) return round;
    return round.metrics.qualityScore > best.metrics.qualityScore ? round : best;
  }, null);
}
