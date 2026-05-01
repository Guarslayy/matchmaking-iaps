# REST API

The backend exposes a small JSON API over the built-in Node.js HTTP server. Authentication is intentionally omitted because this is a lab simulator.

Base URL:

```text
http://localhost:3000
```

All request and response bodies are JSON.

## Data Shapes

### PlayerDTO

```json
{
  "id": 1,
  "name": "Ariana",
  "elo": 1029,
  "gamesPlayed": 1,
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

### MatchDTO

```json
{
  "id": 1,
  "playerId": 1,
  "opponentId": 2,
  "result": "win",
  "eloBefore": 1010,
  "eloAfter": 1029,
  "opponentElo": 1080,
  "color": "white",
  "algorithmUsed": "greedy",
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

### Round Metrics

```json
{
  "playersCount": 12,
  "pairsCount": 6,
  "matchedPlayers": 12,
  "unmatchedPlayers": 0,
  "matchRate": 1,
  "avgRatingDiff": 78.33,
  "minRatingDiff": 60,
  "maxRatingDiff": 160,
  "avgWaitTime": 42,
  "avgComputeTimeMs": 0.1234,
  "qualityScore": 87
}
```

## Endpoints

### Healthcheck

```http
GET /
```

Response:

```json
{
  "message": "API is running"
}
```

### List Players

```http
GET /players
```

Returns all players sorted by ELO descending.

### Create Player

```http
POST /players
```

Request:

```json
{
  "name": "Ivan",
  "initialElo": 1200
}
```

`initialElo` is optional and defaults to `1200`.

### Get Player

```http
GET /players/:id
```

Returns `404` when the player does not exist.

### Get Player History

```http
GET /players/:id/history
```

Returns `MatchDTO[]` for the selected player, sorted from newest to oldest.

### Find Match For One Player

```http
POST /match/find
```

Request:

```json
{
  "playerId": 1,
  "algorithm": "hybrid_weighted",
  "alpha": 0.7,
  "beta": 0.3
}
```

Valid algorithms:

- `baseline`
- `greedy`
- `batch_lite`
- `hybrid_weighted`

For `hybrid_weighted`, `alpha` and `beta` are optional.

Responses:

- `200 OK` with `MatchResultDTO` when a match is found.
- `202 Accepted` with `{ "message": "waiting" }` when no pair exists yet.
- `404 Not Found` when `playerId` does not exist.

### Get Aggregate Metrics

```http
GET /metrics?algorithm=greedy
```

Returns aggregate metrics collected from completed matches for the requested algorithm.

### Reset Demo Store

```http
POST /demo/reset
```

Clears players, matches, queue requests, algorithm metrics, and simulation rounds.

### Seed Demo Data

```http
POST /demo/seed
```

Resets the store and creates a repeatable demo pool of 12 players with different ELO ratings.

### Run Simulation Round

```http
POST /simulation/round
```

Runs a full matching round for all players currently in the database.

Request:

```json
{
  "algorithm": "greedy"
}
```

For `hybrid_weighted`:

```json
{
  "algorithm": "hybrid_weighted",
  "alpha": 0.7,
  "beta": 0.3
}
```

Response includes:

- selected algorithm;
- round metrics;
- selected pairs;
- each player's ELO before and after;
- unmatched players, if any.

### Compare All Algorithms

```http
POST /simulation/compare
```

Runs all algorithms on the same seeded demo dataset. This is the preferred endpoint for fair comparison in the frontend.

Important detail: before each algorithm run, the store is reset and seeded with the same demo players. This prevents later algorithms from benefiting or suffering from ELO changes caused by earlier runs.

### List Simulation Rounds

```http
GET /simulation/rounds?limit=20
```

Returns recent simulation rounds, newest first.

## Example Flow

```bash
curl -X POST http://localhost:3000/demo/seed

curl -X POST http://localhost:3000/simulation/round \
  -H "Content-Type: application/json" \
  -d "{\"algorithm\":\"greedy\"}"

curl -X POST http://localhost:3000/simulation/compare

curl http://localhost:3000/simulation/rounds?limit=4
```
