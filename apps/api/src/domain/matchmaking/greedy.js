export class GreedyMatchmakingAlgorithm {
  constructor(maxRatingGap = 200) {
    this.maxRatingGap = maxRatingGap;
  }

  findPair(queue, nowIso) {
    if (queue.length < 2) return null;

    const sorted = [...queue].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    const now = Date.parse(nowIso);

    for (const left of sorted) {
      const candidate = sorted
        .filter((right) => right.id !== left.id)
        .map((right) => ({ right, diff: Math.abs(left.ratingSnapshot - right.ratingSnapshot) }))
        .filter((entry) => entry.diff <= this.maxRatingGap)
        .sort((a, b) => a.diff - b.diff)[0];

      if (candidate) {
        return {
          left,
          right: candidate.right,
          algorithm: 'greedy',
          ratingDiff: candidate.diff,
          estimatedWaitSeconds: Math.round((now - Math.min(Date.parse(left.createdAt), Date.parse(candidate.right.createdAt))) / 1000),
        };
      }
    }

    return null;
  }
}
