# Architecture

The project is a small monorepo with a backend simulation engine and a React dashboard.

## High-Level Flow

```text
React Dashboard
  -> REST API
    -> Application Commands
      -> Domain Algorithms
      -> Repositories
        -> JSON Store
```

The backend owns the simulation logic. The frontend only requests data, starts rounds, and visualizes the result.

## Layers

### Domain

Path:

```text
apps/api/src/domain
```

Contains core concepts:

- `Player`
- `Match`
- `QueueRequest`
- ELO calculator
- matchmaking algorithms

Domain code does not depend on HTTP or file storage.

### Application

Path:

```text
apps/api/src/application
```

Contains use cases:

- `RegisterPlayerCommand`
- `RunMatchmakingCommand`
- `CompleteMatchCommand`
- `RunSimulationRoundCommand`
- `CompareAlgorithmsCommand`
- `SeedDemoDataCommand`
- player and round queries

This layer coordinates repositories and domain logic.

### Infrastructure

Path:

```text
apps/api/src/infrastructure
```

Contains:

- JSON store utilities;
- repositories for players, matches, queue requests, metrics, and rounds;
- random result resolver.

The JSON store is not meant to be production-grade. It is used because it is transparent and easy to demonstrate in a lab setting.

### Presentation

Path:

```text
apps/api/src/presentation/http
```

Contains:

- HTTP routes;
- JSON parsing helpers;
- validation helpers;
- CORS response helpers.

The route layer is intentionally thin. It validates HTTP input and delegates work to application commands.

### Frontend

Path:

```text
apps/web/src
```

The frontend is a React + Bootstrap + Vite dashboard.

Important files:

- `App.jsx` - application composition and actions.
- `api.js` - REST client.
- `algorithms.js` - algorithm metadata for UI.
- `format.js` - formatting helpers.
- `rounds.js` - round selection helpers.
- `components/*` - visual components.

Main visual components:

- `HeroShowcase`
- `AlgorithmPicker`
- `MetricCard`
- `PlayerTable`
- `RoundView`
- `Comparison`
- `RoundHistory`

## Backend Dependencies

The backend intentionally uses only Node.js built-in modules.

Reasons:

- easier to run on another computer;
- no database installation;
- no framework setup;
- the focus stays on algorithms.

## Data Store

The store file is:

```text
apps/api/data/matchmaking.json
```

It contains:

- counters;
- players;
- matches;
- queue requests;
- algorithm metrics;
- simulation rounds.

The folder is ignored by Git because it is runtime data.

## Simulation Round

`RunSimulationRoundCommand` does this:

1. Clears the queue.
2. Reads all players.
3. Adds every player to the queue with simulated waiting timestamps.
4. Repeatedly asks the selected algorithm for one pair.
5. Removes paired players from the queue.
6. Completes each match.
7. Updates ELO.
8. Builds round-level metrics.
9. Saves the round for dashboard/history display.

## Fair Comparison

`CompareAlgorithmsCommand` runs all algorithms in a controlled way:

1. Seed the same demo pool.
2. Run `baseline`.
3. Reset and seed the same demo pool.
4. Run `greedy`.
5. Repeat for `batch_lite` and `hybrid_weighted`.

This avoids unfair comparisons where later algorithms receive already-changed ELO values.

## Algorithm Contract

Each algorithm exposes:

```js
findPair(queue, nowIso, options)
```

It returns either:

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

or `null` if no pair can be selected.

## Frontend Data Flow

Initial load:

```text
GET /players
GET /simulation/rounds?limit=24
```

Single selected round:

```text
POST /simulation/round
GET /players
GET /simulation/rounds?limit=24
```

Full comparison:

```text
POST /simulation/compare
```

The comparison endpoint already returns the players and rounds needed by the UI.

## Extension Points

Good future improvements:

- deterministic result resolver for reproducible tests;
- larger synthetic datasets;
- median and percentile metrics;
- real charting library;
- import/export experiment results;
- SQLite/PostgreSQL persistence;
- automated integration tests for endpoints.
