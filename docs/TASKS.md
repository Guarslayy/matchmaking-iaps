# Project Tasks

This file summarizes the current implementation status and reasonable follow-up tasks.

## Completed

- Backend HTTP API on Node.js built-in `node:http`.
- Layered backend structure:
  - domain;
  - application;
  - infrastructure;
  - presentation.
- JSON file persistence.
- Player registration.
- Player profile and match history.
- ELO update after matches.
- Queue request storage.
- Single-player matchmaking endpoint.
- Full simulation round endpoint.
- Fair comparison endpoint for all algorithms.
- Demo seed/reset endpoints.
- Aggregate metrics endpoint.
- React + Bootstrap frontend dashboard.
- Algorithm picker.
- Player pool view.
- Latest round view.
- Pair cards with winners and ELO changes.
- Algorithm comparison cards.
- Round history.
- Documentation for API, architecture, and algorithms.

## Useful Next Tasks

### 1. Add deterministic experiment mode

Current match winners are random. For reproducible lab results, add a deterministic mode where the winner is selected by a seeded pseudo-random generator or by rating probability.

Acceptance criteria:

- Same seed produces the same winners.
- Frontend can trigger deterministic comparison.
- Report can include repeatable tables.

### 2. Add larger generated datasets

The demo pool currently contains 12 players. Add dataset presets:

- small: 12 players;
- medium: 50 players;
- large: 200 players.

Acceptance criteria:

- API can seed selected dataset size.
- Dashboard can compare algorithms on different sizes.
- Metrics show compute-time differences more clearly.

### 3. Add median and percentile metrics

Average values can hide bad cases. Add:

- median rating difference;
- 90th percentile rating difference;
- median wait time;
- max wait time.

Acceptance criteria:

- Metrics are returned from round endpoints.
- Dashboard shows at least median and worst-case values.

### 4. Add automated endpoint tests

Add lightweight integration tests for:

- `POST /demo/seed`;
- `POST /simulation/round`;
- `POST /simulation/compare`;
- `GET /players`;
- `GET /simulation/rounds`.

Acceptance criteria:

- Tests can be run by one npm script.
- Tests reset runtime data before execution.

### 5. Improve algorithm research section

Extend `docs/ALGORITHMS.md` with:

- sample result tables;
- screenshots from the dashboard;
- explanation of why metrics differ between algorithms.

Acceptance criteria:

- The document can be used directly in the lab report.
- Each algorithm has a short conclusion.

### 6. Add export results button

Allow exporting the latest comparison as JSON or CSV for the written report.

Acceptance criteria:

- Frontend has an export action.
- Export contains algorithm names and all metrics.

### 7. Optional: move persistence to SQLite

JSON is enough for the current lab. SQLite can be added later if the course requires a database section.

Acceptance criteria:

- Repository interfaces remain stable.
- Existing API behavior does not change.
- Demo still runs without manual setup.
