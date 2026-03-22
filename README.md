#TEST

# Matchmaking System IAPS

Backend-first MVP для дисциплины **IAPS21.1**. Проект моделирует очередь игроков, работу алгоритмов матчмейкинга и симуляцию матчей без зависимости от фронтенда.

## Текущий стек

- **Backend**: Node.js (ES modules, layered architecture, built-in `node:http`)
- **Persistence**: локальное файловое хранилище JSON в `apps/api/data/matchmaking.json`
- **Monorepo**: lightweight monorepo layout (no external packages required for the API demo)
- **Shared package**: DTO и общие типы в `packages/shared`

> Проект не использует `node:sqlite`, поэтому запускается на обычном Node.js 20.x и выше без установки дополнительных пакетов.

## Улучшённая архитектура

Проект разделён на 4 уровня:

1. **Domain** — сущности, расчёт ELO, алгоритмы матчмейкинга.
2. **Application** — сценарии (`registerPlayer`, `runMatchmaking`, `completeMatch`, queries).
3. **Infrastructure** — файловое хранилище, репозитории, random result resolver.
4. **Presentation** — HTTP API на встроенном `node:http`.

Главное архитектурное улучшение относительно исходной идеи: алгоритмы возвращают **PairCandidate**, а не `Match`. Это отделяет поиск пары от завершения матча и упрощает развитие системы.

## Реализованные endpoints

- `GET /` — healthcheck
- `POST /players` — создание игрока
- `GET /players/:id` — профиль игрока
- `GET /players/:id/history` — история матчей игрока
- `POST /match/find` — постановка в очередь и попытка найти матч
- `GET /metrics?algorithm=baseline|greedy|batch_lite` — агрегированные метрики

## Как запустить проект

### 1. Проверить версию Node.js

```bash
node -v
```

Рекомендуемый диапазон: **Node.js 20+**.

### 2. Запустить API

```bash
npm run start:api
```

После запуска API будет доступен по адресу `http://localhost:3000`.

### 3. Полный демо-прогон одной командой

```bash
npm run demo
```

Эта команда:
- очищает demo-хранилище,
- поднимает API,
- создаёт 6 игроков,
- прогоняет `baseline`, `greedy` и `batch_lite`,
- показывает профили, историю и метрики,
- завершает сервер автоматически.

### 4. Отдельные служебные команды

```bash
npm run reset:db
npm run seed:demo
```

`seed:demo` полезен, если API уже запущен и нужно быстро наполнить систему демонстрационными игроками.

## Сценарий для презентации

1. Выполнить `npm run demo`.
2. Показать, что для каждого алгоритма сначала приходит состояние `waiting`, а затем — готовый матч.
3. Показать обновлённый профиль игрока и историю матчей.
4. Показать метрики по каждому алгоритму.

## Примеры ручных запросов

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
