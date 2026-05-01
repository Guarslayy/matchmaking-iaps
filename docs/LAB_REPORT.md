# Lab Report Draft

## Topic

Design and implementation of a matchmaking simulator with comparative analysis of player pairing algorithms.

## 1. Domain Analysis

Matchmaking is used in online games, rating platforms, tournaments, education systems, and team-selection services. The core problem is choosing suitable opponents from a waiting pool.

The main conflict is:

```text
fast pairing vs balanced pairing
```

If the system pairs players too quickly, match quality can be poor. If it waits too long for a perfect opponent, users wait too much.

This project studies that trade-off through a small reproducible simulator.

## 2. Formal Problem Statement

Given:

- a set of players;
- each player has an ELO rating;
- players enter a matchmaking queue;
- each queue entry has a waiting time.

Find:

- a set of non-overlapping player pairs;
- with acceptable rating difference;
- with reasonable waiting time;
- and measurable compute cost.

## 3. Algorithms

The project implements four algorithms.

### Baseline

Selects the pair with the smallest ELO difference among all possible pairs.

Purpose: control strategy for comparison.

### Greedy

Prioritizes players who waited longer and selects a close enough opponent.

Purpose: practical queue servicing strategy.

### Batch Lite

Processes a batch of players, sorts by rating, and pairs rating neighbours.

Purpose: simple batch-based matching strategy.

### Hybrid Weighted

Combines rating quality and waiting time into a weighted score:

```text
finalScore = alpha * normalizedRatingScore + beta * normalizedWaitScore
```

Purpose: multi-criteria algorithm with tunable weights.

## 4. Evaluation Metrics

The following metrics are collected for every simulation round:

| Metric | Description |
|---|---|
| `pairsCount` | Number of created pairs |
| `matchRate` | Share of players that received a match |
| `avgRatingDiff` | Average ELO difference inside pairs |
| `avgWaitTime` | Average simulated waiting time |
| `avgComputeTimeMs` | Average compute time per pair |
| `qualityScore` | Weighted score from 0 to 100 |

Quality formula:

```text
qualityScore = matchRate * 0.4
             + ratingQuality * 0.4
             + waitQuality * 0.2
```

This gives the report a concrete numerical comparison instead of subjective discussion.

## 5. Application Architecture

The system consists of two parts:

1. Backend simulation engine.
2. React dashboard.

Backend layers:

- Domain: entities, ELO, algorithms.
- Application: commands and queries.
- Infrastructure: JSON persistence and repositories.
- Presentation: HTTP API.

Frontend:

- React + Bootstrap + Vite.
- Visualizes player pool, rounds, pairs, winners, ELO changes, comparison metrics, and round history.

## 6. Database / Persistence

The project uses a local JSON store:

```text
apps/api/data/matchmaking.json
```

Stored data:

- players;
- matches;
- queue requests;
- algorithm metrics;
- simulation rounds;
- counters.

This approach was selected because the course focus is algorithms, and JSON makes the state easy to inspect during presentation.

## 7. Testing Scenarios

### Test 1: Single Algorithm Round

Goal: show how one selected algorithm pairs the full demo pool.

Steps:

1. Seed demo data.
2. Select one algorithm.
3. Run selected round.
4. Inspect generated pairs and ELO changes.

Expected result:

- all or most players receive a pair;
- winners are selected;
- ELO changes after each match;
- round metrics are saved.

### Test 2: Fair Algorithm Comparison

Goal: compare all algorithms on the same input data.

Steps:

1. Click `Run all algorithms`.
2. Backend resets and reseeds demo data before each algorithm.
3. Dashboard displays comparison cards.

Expected result:

- every algorithm starts from the same player ratings;
- comparison is fair;
- metrics can be copied into the written report.

### Test 3: Repeated Rounds

Goal: demonstrate that the system state evolves.

Steps:

1. Run a selected round.
2. Observe ELO changes.
3. Run another round.
4. Compare pair distribution.

Expected result:

- player ratings change;
- next round may create different pairs;
- round history records each run.

### Test 4: Hybrid Weighted Explanation

Goal: explain the multi-criteria algorithm.

Steps:

1. Run `hybrid_weighted`.
2. Inspect final score values in pair cards.
3. Explain `alpha` and `beta`.

Expected result:

- the selected pairs can be explained by rating and waiting-time score.

## 8. Example Comparison Table

The exact numbers depend on random match outcomes and runtime timing, but the dashboard produces a table in this format:

| Algorithm | Pairs | Match Rate | Avg ELO Diff | Avg Compute | Quality |
|---|---:|---:|---:|---:|---:|
| Baseline | 6 | 100% | 171.67 | 0.20ms | 77 |
| Greedy | 6 | 100% | 78.33 | 0.12ms | 87 |
| Batch Lite | 6 | 100% | 78.33 | 0.10ms | 87 |
| Hybrid Weighted | 6 | 100% | 171.67 | 0.40ms | 78 |

These values are examples from one run and should be regenerated before final presentation.

## 9. Result

The project implements a working simulator where:

- players are generated with different ratings;
- algorithms create pairs;
- matches are simulated;
- ELO is updated;
- metrics are collected;
- frontend displays the process visually.

The result is suitable for demonstrating algorithm behavior during an IAPS lab presentation.

## 10. Limitations

- Match winner is random, not based on rating probability.
- JSON persistence is not production-grade.
- Batch Lite is intentionally simplified.
- Quality score is educational and can be tuned.
- There are no automated integration tests yet.

## 11. Future Work

- deterministic experiment mode;
- larger generated datasets;
- median and percentile metrics;
- export comparison results;
- automated tests;
- optional SQLite persistence.

## 12. Presentation Summary

Short explanation for defense:

```text
The project studies matchmaking algorithms.
The problem is to balance rating quality, waiting time, and compute cost.
I implemented four algorithms and a simulator that runs them on the same player pool.
The frontend shows generated pairs, winners, ELO changes, and metrics.
The main algorithmic comparison is based on match rate, average ELO difference, waiting time, compute time, and quality score.
```
