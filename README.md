# Matchmaking System IAPS

Backend-first MVP для дисциплины **IAPS21.1**. Проект моделирует очередь игроков, работу алгоритмов матчмейкинга и симуляцию матчей без зависимости от фронтенда.

## Текущий стек

- **Backend**: Node.js (ES modules, layered architecture, built-in `node:http`)
- **Frontend**: React + Bootstrap + Vite (`apps/web`)
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
- `GET /metrics?algorithm=baseline|greedy|batch_lite|hybrid_weighted` — агрегированные метрики
- `POST /demo/seed` — сброс и наполнение базы демонстрационными игроками
- `POST /demo/reset` — очистка demo-хранилища
- `GET /players` — список игроков и их текущий ELO
- `POST /simulation/round` — массовый раунд: все игроки из базы ищут пары выбранным алгоритмом
- `POST /simulation/compare` — честный прогон всех алгоритмов на одинаковом demo-наборе
- `GET /simulation/rounds` — история раундов для frontend-дашборда

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

### 3. Запустить frontend

```bash
npm --prefix apps/web install
npm run start:web
```

Frontend будет доступен по адресу `http://127.0.0.1:5173`.

В интерфейсе можно:

- заполнить demo-базу игроками с разным ELO;
- выбрать алгоритм;
- запустить раунд матчмейкинга;
- запустить все алгоритмы одной кнопкой для быстрого сравнения;
- увидеть пары, победителей и изменение ELO;
- сравнить алгоритмы по конкретным метрикам и графикам.

### 4. Полный демо-прогон одной командой

```bash
npm run demo
```

Эта команда:
- очищает demo-хранилище,
- поднимает API,
- создаёт 6 игроков,
- прогоняет `baseline`, `greedy`, `batch_lite` и `hybrid_weighted`,
- показывает профили, историю и метрики,
- завершает сервер автоматически.

### 5. Отдельные служебные команды

```bash
npm run reset:db
npm run seed:demo
```

`seed:demo` полезен, если API уже запущен и нужно быстро наполнить систему демонстрационными игроками.


### Новый алгоритм: `hybrid_weighted`

`hybrid_weighted` строит все уникальные пары из текущей очереди, считает для каждой пары итоговый взвешенный скор:

- `ratingScore = 1 / (1 + |ratingA - ratingB|)`
- `waitScore = average(waitASeconds, waitBSeconds)`
- нормализация обоих компонентов в диапазон `[0, 1]`
- `finalScore = alpha * normalizedRatingScore + beta * normalizedWaitScore`

После этого пары сортируются по `finalScore` по убыванию, и матчи собираются жадно без конфликтов (игрок может попасть максимум в одну пару за прогон).

По умолчанию используются `alpha = 0.7`, `beta = 0.3`, но их можно передать в `POST /match/find` для алгоритма `hybrid_weighted`.

## Метрики сравнения алгоритмов

Для защиты и отчёта используются конкретные численные показатели:

- `pairsCount` — сколько пар сформировано за раунд.
- `matchedPlayers` — сколько игроков получили матч.
- `unmatchedPlayers` — сколько игроков осталось без пары.
- `matchRate` — доля игроков, которым удалось найти соперника.
- `avgRatingDiff` — средняя разница ELO внутри сформированных пар.
- `minRatingDiff` / `maxRatingDiff` — лучший и худший разброс ELO за раунд.
- `avgWaitTime` — среднее время ожидания пары.
- `avgComputeTimeMs` — среднее время вычисления одной пары.
- `qualityScore` — итоговая учебная оценка алгоритма по шкале 0-100.

Итоговая оценка считается как взвешенная сумма:

```text
qualityScore = matchRate * 0.4
             + ratingQuality * 0.4
             + waitQuality * 0.2
```

Где `ratingQuality` уменьшается при росте средней разницы ELO, а `waitQuality` уменьшается при росте времени ожидания. Это позволяет сравнивать алгоритмы не словами, а воспроизводимыми числами.

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
