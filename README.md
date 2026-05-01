# Matchmaking System IAPS

Algorithm-focused matchmaking simulator for the IAPS course. The project models a player pool, queue-based pairing strategies, match simulation, ELO updates, algorithm metrics, and a React dashboard for live demonstration.

The main goal is not CRUD. The main goal is to demonstrate how different matchmaking algorithms behave on the same set of players.

## Stack

- Backend: Node.js, ES modules, built-in `node:http`
- Frontend: React, Bootstrap, Vite
- Persistence: local JSON store at `apps/api/data/matchmaking.json`
- Shared package: common algorithm type lists in `packages/shared`
- Runtime target: Node.js 20+

No external backend database is required. The JSON store is used intentionally to keep the lab project easy to run and inspect.

## What The App Demonstrates

- A demo pool of players with different ELO ratings.
- Four matchmaking algorithms:
  - `baseline`
  - `greedy`
  - `batch_lite`
  - `hybrid_weighted`
- Full simulation rounds where all available players are paired.
- Match completion with random winner selection.
- ELO changes after every match.
- Algorithm comparison by concrete metrics.
- A React dashboard with player pool, latest round, pair cards, comparison cards, and round history.

## Metrics

The simulator uses these metrics for algorithm comparison:

| Metric | Meaning | Better |
|---|---|---|
| `pairsCount` | Number of pairs created in a round | Higher |
| `matchedPlayers` | Number of players that received a match | Higher |
| `unmatchedPlayers` | Number of players left without a pair | Lower |
| `matchRate` | Matched players divided by all players | Higher |
| `avgRatingDiff` | Average absolute ELO difference inside pairs | Lower |
| `minRatingDiff` | Best ELO difference in the round | Lower |
| `maxRatingDiff` | Worst ELO difference in the round | Lower |
| `avgWaitTime` | Average simulated waiting time in seconds | Lower |
| `avgComputeTimeMs` | Average compute time per selected pair | Lower |
| `qualityScore` | Weighted educational score from 0 to 100 | Higher |

Current score formula:

```text
qualityScore = matchRate * 0.4
             + ratingQuality * 0.4
             + waitQuality * 0.2
```

`ratingQuality` decreases when `avgRatingDiff` grows. `waitQuality` decreases when `avgWaitTime` grows.

## Algorithms

### Baseline

Scans all possible pairs in the queue and selects the pair with the smallest ELO difference.

### Greedy

Sorts queue entries by waiting time and selects the first acceptable close-rating opponent for the longest-waiting player.

### Batch Lite

Takes a batch of queue entries, sorts them by rating, and pairs close neighbours.

### Hybrid Weighted

Builds candidate pairs and scores them by rating quality and waiting time:

```text
ratingScore = 1 / (1 + abs(ratingA - ratingB))
waitScore = average(waitASeconds, waitBSeconds)
finalScore = alpha * normalizedRatingScore + beta * normalizedWaitScore
```

Default values:

```text
alpha = 0.7
beta = 0.3
```

## Project Structure

```text
apps/
  api/
    src/
      application/     use cases and queries
      domain/          entities, ELO service, matchmaking algorithms
      infrastructure/  JSON store, repositories, result resolver
      presentation/    HTTP routes and utilities
  web/
    src/
      components/      React UI components
      api.js           frontend API client
      algorithms.js    algorithm metadata
      format.js        formatting helpers
      rounds.js        round helpers
packages/
  shared/              shared algorithm lists
docs/
  API.md
  ARCHITECTURE.md
  ALGORITHMS.md
  LAB_REPORT.md
  TASKS.md
```

## Run Locally

### Quick Start For The Team

Use these steps if you are opening the project for the first time.

1. Clone the repository:

```bash
git clone https://github.com/Guarslayy/matchmaking-iaps.git
cd matchmaking-iaps
```

2. Check Node.js version:

```bash
node -v
```

Node.js 20+ is recommended. If Node.js is missing, install it from `https://nodejs.org/`.

3. Install frontend dependencies:

```bash
npm --prefix apps/web install
```

4. Start the backend in the first terminal:

```bash
npm run start:api
```

Backend URL:

```text
http://localhost:3000
```

Opening this URL should return:

```json
{
  "message": "API is running"
}
```

5. Start the frontend in the second terminal:

```bash
npm run start:web
```

Frontend URL:

```text
http://127.0.0.1:5173
```

6. Use the app:

- click `Reset demo pool` to create demo players;
- choose an algorithm;
- click `Run selected round` to run one algorithm;
- click `Run all algorithms` to compare all algorithms on the same dataset.

7. If the page looks outdated, hard-refresh the browser:

```text
Ctrl + F5
```

In short, the project usually needs two terminals:

```bash
npm run start:api
```

```bash
npm run start:web
```

### Verification

Backend syntax check:

```bash
npm run check
```

Frontend production build:

```bash
npm --prefix apps/web run build
```

Both commands should complete successfully.

## Demo Flow

1. Click `Reset demo pool` to create the repeatable player set.
2. Click `Run selected round` to run one algorithm.
3. Click `Run all algorithms` to compare all algorithms on the same demo dataset.
4. Show:
   - player ELO changes;
   - generated pairs;
   - winners and ELO deltas;
   - algorithm comparison cards;
   - round history.

## API Highlights

- `GET /players`
- `POST /players`
- `GET /players/:id`
- `GET /players/:id/history`
- `POST /match/find`
- `GET /metrics?algorithm=baseline`
- `POST /demo/seed`
- `POST /demo/reset`
- `POST /simulation/round`
- `POST /simulation/compare`
- `GET /simulation/rounds`

See [docs/API.md](docs/API.md) for details.

## Documentation

- [REST API](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Algorithms and Evaluation](docs/ALGORITHMS.md)
- [Lab Report Draft](docs/LAB_REPORT.md)
- [Project Tasks](docs/TASKS.md)
