# Matchmaking System IAPS

Backend-first MVP для дисциплины **IAPS21.1**. Проект моделирует очередь игроков, работу алгоритмов матчмейкинга и симуляцию матчей без зависимости от фронтенда.

## Текущий стек

- **Backend**: Node.js (ES modules, layered architecture, built-in `node:http`)
- **Database**: SQLite (`node:sqlite`)
- **Monorepo**: lightweight monorepo layout (no external packages required for the API demo)
- **Shared package**: DTO и общие типы в `packages/shared`

## Улучшённая архитектура

Проект разделён на 4 уровня:

1. **Domain** — сущности, расчёт ELO, алгоритмы матчмейкинга.
2. **Application** — сценарии (`registerPlayer`, `runMatchmaking`, `completeMatch`, queries).
3. **Infrastructure** — SQLite, репозитории, random result resolver.
4. **Presentation** — HTTP API на встроенном `node:http`.

Главное архитектурное улучшение относительно исходной идеи: алгоритмы возвращают **PairCandidate**, а не `Match`. Это отделяет поиск пары от завершения матча и упрощает развитие системы.

## Реализованные endpoints

- `GET /` — healthcheck
- `POST /players` — создание игрока
- `GET /players/:id` — профиль игрока
- `GET /players/:id/history` — история матчей игрока
- `POST /match/find` — постановка в очередь и попытка найти матч
- `GET /metrics?algorithm=baseline|greedy|batch_lite` — агрегированные метрики

## Быстрый старт

```bash
npm run start:api
```

После запуска API будет доступен по адресу `http://localhost:3000`.

## Примеры запросов

Создание игрока:

```bash
curl -X POST http://localhost:3000/players \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ivan"}'
```

Поиск матча:

```bash
curl -X POST http://localhost:3000/match/find \
  -H 'Content-Type: application/json' \
  -d '{"playerId":1,"algorithm":"baseline"}'
```
