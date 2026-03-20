export function updateElo(currentElo, opponentElo, score, kFactor = 32) {
  const expected = 1 / (1 + 10 ** ((opponentElo - currentElo) / 400));
  return Math.round(currentElo + kFactor * (score - expected));
}
