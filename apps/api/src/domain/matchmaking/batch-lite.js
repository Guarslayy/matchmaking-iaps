export class BatchLiteMatchmakingAlgorithm {
  constructor(batchSize = 20) {
    this.batchSize = batchSize;
  }

  findPair(queue, nowIso) {
    if (queue.length < 2) return null;

    const now = Date.parse(nowIso);
    const batch = [...queue]
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(0, this.batchSize)
      .sort((a, b) => a.ratingSnapshot - b.ratingSnapshot);

    if (batch.length < 2) return null;

    const [left, right] = batch;
    return {
      left,
      right,
      algorithm: 'batch_lite',
      ratingDiff: Math.abs(left.ratingSnapshot - right.ratingSnapshot),
      estimatedWaitSeconds: Math.round((now - Math.min(Date.parse(left.createdAt), Date.parse(right.createdAt))) / 1000),
    };
  }
}
