function normalize(value, min, max) {
  if (max === min) {
    return 1;
  }
  return (value - min) / (max - min);
}

function buildPairDebug(left, right, nowMs) {
  const ratingDiff = Math.abs(left.ratingSnapshot - right.ratingSnapshot);
  const ratingScoreRaw = 1 / (1 + ratingDiff);

  const leftWaitSeconds = Math.max(0, (nowMs - Date.parse(left.createdAt)) / 1000);
  const rightWaitSeconds = Math.max(0, (nowMs - Date.parse(right.createdAt)) / 1000);
  const avgWaitSeconds = (leftWaitSeconds + rightWaitSeconds) / 2;

  return {
    left,
    right,
    ratingDiff,
    ratingScoreRaw,
    avgWaitSeconds,
  };
}

export function buildHybridMatches(queuedPlayers, currentTime, alpha = 0.7, beta = 0.3) {
  if (!Array.isArray(queuedPlayers) || queuedPlayers.length < 2) {
    return {
      selectedMatches: [],
      candidatePairs: [],
      metrics: {
        selectedPairsCount: 0,
        unmatchedPlayers: Array.isArray(queuedPlayers) ? queuedPlayers.length : 0,
        avgSelectedRatingDiff: 0,
      },
    };
  }

  const nowMs = Date.parse(currentTime);
  const candidates = [];

  for (let i = 0; i < queuedPlayers.length - 1; i += 1) {
    for (let j = i + 1; j < queuedPlayers.length; j += 1) {
      candidates.push(buildPairDebug(queuedPlayers[i], queuedPlayers[j], nowMs));
    }
  }

  const minRatingScore = Math.min(...candidates.map((entry) => entry.ratingScoreRaw));
  const maxRatingScore = Math.max(...candidates.map((entry) => entry.ratingScoreRaw));
  const minWaitScore = Math.min(...candidates.map((entry) => entry.avgWaitSeconds));
  const maxWaitScore = Math.max(...candidates.map((entry) => entry.avgWaitSeconds));

  const scoredCandidates = candidates.map((entry) => {
    const normalizedRatingScore = normalize(entry.ratingScoreRaw, minRatingScore, maxRatingScore);
    const normalizedWaitScore = normalize(entry.avgWaitSeconds, minWaitScore, maxWaitScore);
    const finalScore = alpha * normalizedRatingScore + beta * normalizedWaitScore;

    return {
      ...entry,
      normalizedRatingScore,
      normalizedWaitScore,
      finalScore,
    };
  });

  scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);

  const usedPlayerIds = new Set();
  const selectedMatches = [];

  for (const candidate of scoredCandidates) {
    if (usedPlayerIds.has(candidate.left.playerId) || usedPlayerIds.has(candidate.right.playerId)) {
      continue;
    }

    selectedMatches.push(candidate);
    usedPlayerIds.add(candidate.left.playerId);
    usedPlayerIds.add(candidate.right.playerId);
  }

  const avgSelectedRatingDiff = selectedMatches.length === 0
    ? 0
    : selectedMatches.reduce((acc, entry) => acc + entry.ratingDiff, 0) / selectedMatches.length;

  return {
    selectedMatches,
    candidatePairs: scoredCandidates,
    metrics: {
      selectedPairsCount: selectedMatches.length,
      unmatchedPlayers: queuedPlayers.length - selectedMatches.length * 2,
      avgSelectedRatingDiff,
    },
  };
}

export class HybridWeightedMatchmakingAlgorithm {
  constructor(defaultAlpha = 0.7, defaultBeta = 0.3) {
    this.defaultAlpha = defaultAlpha;
    this.defaultBeta = defaultBeta;
    this.lastRun = null;
  }

  findPair(queue, nowIso, options = {}) {
    const alpha = typeof options.alpha === 'number' ? options.alpha : this.defaultAlpha;
    const beta = typeof options.beta === 'number' ? options.beta : this.defaultBeta;
    const run = buildHybridMatches(queue, nowIso, alpha, beta);
    this.lastRun = run;

    if (run.selectedMatches.length === 0) {
      return null;
    }

    const best = run.selectedMatches[0];
    return {
      left: best.left,
      right: best.right,
      algorithm: 'hybrid_weighted',
      ratingDiff: best.ratingDiff,
      estimatedWaitSeconds: Math.round(best.avgWaitSeconds),
      debug: {
        alpha,
        beta,
        finalScore: best.finalScore,
      },
    };
  }
}
