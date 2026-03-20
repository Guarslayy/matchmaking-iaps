export class BaselineMatchmakingAlgorithm {
  findPair(queue, nowIso) {
    if (queue.length < 2) return null;

    let best = null;
    const now = Date.parse(nowIso);

    for (let i = 0; i < queue.length - 1; i += 1) {
      for (let j = i + 1; j < queue.length; j += 1) {
        const left = queue[i];
        const right = queue[j];
        const ratingDiff = Math.abs(left.ratingSnapshot - right.ratingSnapshot);
        const estimatedWaitSeconds = Math.round((now - Math.min(Date.parse(left.createdAt), Date.parse(right.createdAt))) / 1000);

        if (!best || ratingDiff < best.ratingDiff) {
          best = { left, right, algorithm: 'baseline', ratingDiff, estimatedWaitSeconds };
        }
      }
    }

    return best;
  }
}
