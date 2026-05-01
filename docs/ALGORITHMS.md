# Algorithms And Evaluation

This document describes the algorithmic part of the matchmaking simulator.

## Problem Statement

Given a set of players waiting for a match, the system must create pairs. A good algorithm should:

- match as many players as possible;
- keep ELO differences low;
- avoid excessive waiting;
- run quickly enough for repeated rounds;
- produce explainable results for demonstration.

There is no single perfect solution. Matchmaking is a trade-off between pair quality and queue service.

## Input

Each queue entry contains:

- player id;
- rating snapshot;
- queue creation time;
- time control.

For full simulation rounds, all players from the demo database are placed into the queue.

## Output

Each algorithm returns one `PairCandidate` at a time:

```js
{
  left,
  right,
  algorithm,
  ratingDiff,
  estimatedWaitSeconds,
  debug
}
```

The round runner repeatedly calls the algorithm until there are fewer than two players or no pair can be selected.

## Baseline

### Idea

Check all possible pairs and select the pair with the smallest rating difference.

### Pseudocode

```text
best = null
for each player A in queue:
  for each player B after A:
    diff = abs(A.rating - B.rating)
    if best is null or diff < best.diff:
      best = pair(A, B)
return best
```

### Complexity

```text
O(n^2)
```

### Strengths

- Very easy to explain.
- Directly optimizes rating difference for the selected pair.
- Useful as a baseline for comparison.

### Weaknesses

- Does not optimize the whole round globally.
- Does not prioritize players who waited longer.
- Can produce weaker full-round distribution when repeated greedily.

## Greedy

### Idea

Serve the queue by waiting time. Take the oldest request and find a close enough opponent.

### Pseudocode

```text
sort queue by createdAt ascending
for each player A in sorted queue:
  candidates = players with rating difference <= maxRatingGap
  if candidates not empty:
    return closest candidate
return null
```

### Complexity

```text
O(n^2 log n) in the simple implementation
```

### Strengths

- Models practical queue servicing.
- Prevents old requests from being ignored.
- Faster and easier to reason about than full optimization.

### Weaknesses

- Local decision, not globally optimal.
- Depends on the `maxRatingGap` threshold.
- May sacrifice rating quality for service fairness.

## Batch Lite

### Idea

Take a batch of waiting players, sort by rating, and pair close neighbours.

### Pseudocode

```text
batch = oldest N queue entries
sort batch by rating
return first neighbouring pair
```

The round runner calls it repeatedly, so the full round gradually consumes the batch.

### Complexity

```text
O(n log n)
```

### Strengths

- Shows a batch-processing strategy.
- Often produces stable rating proximity.
- Good for explaining how matchmaking can work in ticks/rounds.

### Weaknesses

- Simplified version of batch optimization.
- Does not solve global minimum total difference.
- Batch size affects behavior.

## Hybrid Weighted

### Idea

Combine rating quality and waiting time into one score.

Raw components:

```text
ratingScore = 1 / (1 + abs(ratingA - ratingB))
waitScore = average(waitASeconds, waitBSeconds)
```

Both components are normalized to `[0, 1]`.

Final score:

```text
finalScore = alpha * normalizedRatingScore + beta * normalizedWaitScore
```

Default values:

```text
alpha = 0.7
beta = 0.3
```

### Pseudocode

```text
candidates = all unique pairs
for each pair:
  compute ratingScore
  compute waitScore
normalize both scores
compute finalScore
sort candidates by finalScore descending
select non-overlapping pairs greedily
return the best selected pair
```

### Complexity

```text
O(n^2 log n)
```

### Strengths

- Combines multiple criteria.
- Easy to tune with weights.
- Produces explainable debug data.

### Weaknesses

- Still heuristic, not globally optimal.
- Sensitive to normalization and weight choice.
- Can overvalue waiting time if the queue distribution is narrow.

## Evaluation Metrics

| Metric | Formula / Meaning |
|---|---|
| `pairsCount` | Number of selected pairs |
| `matchedPlayers` | `pairsCount * 2` |
| `unmatchedPlayers` | Players not selected in the round |
| `matchRate` | `matchedPlayers / playersCount` |
| `avgRatingDiff` | Average `abs(eloA - eloB)` |
| `avgWaitTime` | Average simulated pair wait time |
| `avgComputeTimeMs` | Compute time divided by selected pairs |
| `qualityScore` | Weighted educational score |

Quality formula:

```text
ratingQuality = max(0, 1 - avgRatingDiff / 400)
waitQuality = max(0, 1 - avgWaitTime / 180)

qualityScore = round(
  (matchRate * 0.4 + ratingQuality * 0.4 + waitQuality * 0.2) * 100
)
```

## Fair Comparison Method

The dashboard uses `POST /simulation/compare`.

This endpoint runs each algorithm on the same seeded player set:

1. Reset store.
2. Seed demo players.
3. Run one algorithm.
4. Save round result.
5. Repeat for the next algorithm.

This makes the comparison more honest because all algorithms start from the same ratings.

## Suggested Presentation Conclusion

For the lab presentation, the main conclusion can be:

```text
Baseline is the simplest control strategy.
Greedy and Batch Lite serve the queue more practically.
Hybrid Weighted demonstrates multi-criteria scoring.
The best algorithm depends on which metric is prioritized:
rating quality, waiting time, or overall balanced score.
```
