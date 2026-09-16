# Поэтапный запуск Docker (мало RAM / стенд ~2 ГБ)

На слабом VPS один `docker compose up -d` поднимает всё сразу: `web` делает `npm ci` + `next build` рядом с `bot`/`mongo` → часто **OOM** (`Killed`).

Compose **не умеет** сам «подождать конец build и потом поднять bot». Поэтому на стенде поднимаем **по шагам вручную** (или скриптом).

Связанная шпаргалка: [`docker-command.md`](./docker-command.md).

---

## Зачем такой порядок

| Шаг | Что                         | Зачем                                             |
| --- | --------------------------- | ------------------------------------------------- |
| 1   | `db-sessions`, `db-courses` | БД для Prisma и Payload, мало RAM                 |
| 2   | `minio` + `createbuckets`   | S3 для картинок (нужен `depends_on` у web)        |
| 3   | **только `web`**            | Тяжёлый `next build` без bot/mongo                |
| 4   | `mongo` + `bot`             | После того как web уже `start` и RAM освободилась |

**Не наоборот:** сначала bot, потом build web — хуже, build снова упрётся в память.

---

## Команды (стенд / production compose)

Из корня проекта на сервере:

```bash
# 0) остановить стек (volumes с данными НЕ трогаем)
docker compose -f docker-compose.yml down

# 1) Postgres
docker compose -f docker-compose.yml up -d db-sessions db-courses
# дождись healthy у обоих

# 2) MinIO
docker compose -f docker-compose.yml up -d minio
docker compose -f docker-compose.yml up createbuckets

# 3) web ОДИН — смотри логи до конца build
docker compose -f docker-compose.yml up -d web
docker compose -f docker-compose.yml logs -f web
# жди: deps → migrate → next build → start server
# Ctrl+C только от логов, контейнер продолжает работать

# 4) бот (когда web уже слушает :3000)
docker compose -f docker-compose.yml up -d mongo bot
```

Параллельно в другом SSH (опционально):

```bash
watch -n 1 free -h
```

Если перед `Killed` `available` ≈ 0 — это OOM. Тогда: swap 2–4 ГБ или вынести build с VPS (CI/образ).
