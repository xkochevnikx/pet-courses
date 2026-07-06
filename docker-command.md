# Docker — pet-courses-project

Шпаргалка по запуску и обслуживанию Docker-окружения проекта.

## Содержание

1. [Общая информация](#1-общая-информация)
2. [Быстрый старт](#2-быстрый-старт)
3. [Локальная разработка](#3-локальная-разработка)
4. [Стенд (сервер)](#4-стенд-сервер)
5. [Диагностика](#5-диагностика)
6. [Управление сервисами](#6-управление-сервисами)
7. [Очистка](#7-очистка)

---

## 1. Общая информация

**Сервисы:**

| Сервис          | Контейнер               | Назначение                      |
| --------------- | ----------------------- | ------------------------------- |
| `db`            | `db`                    | Postgres                        |
| `minio`         | `minio`                 | S3-совместимое хранилище        |
| `createbuckets` | `createbuckets`         | One-shot: создаёт бакет в MinIO |
| `web`           | `web-dev` / `web-stage` | Next.js (dev или stage)         |
| `mongo`         | `mongo`                 | MongoDB для bot / Payload       |
| `bot`           | `bot`                   | Payload 2 + Express (OAuth)     |

**Compose-файлы:**

| Файл                     | Где используется | Что делает                                                  |
| ------------------------ | ---------------- | ----------------------------------------------------------- |
| `docker-compose.yml`     | стенд + база     | db, minio, createbuckets, web, mongo, bot                   |
| `docker-compose.dev.yml` | только локально  | override только для `web` → `web-dev` (hot reload, dev env) |

**Порядок `-f` важен:** сначала базовый файл, потом override.

```bash
# локально — два файла
docker compose -f docker-compose.yml -f docker-compose.dev.yml <команда>

# стенд — только базовый
docker compose -f docker-compose.yml <команда>
```

**Слияние файлов:** второй `-f` дополняет первый. Списки вроде `ports` по умолчанию **склеиваются** (отсюда дубли и `EADDRINUSE`). В dev `ports` не дублируем — берутся из `docker-compose.yml`. Если в dev нужен другой порт — `ports: !override`.

---

## 2. Быстрый старт

### Локальная разработка — одной командой

Поднимает db → minio → createbuckets → web-dev на `localhost:3000`. Сервисы `mongo` и `bot` — из базового compose (поднять отдельно: `up -d mongo bot`).

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web
```

### Стенд — одной командой

Поднимает db → minio → createbuckets → web-stage (migrate → build → start).

```bash
docker compose -f docker-compose.yml up -d
```

---

## 3. Локальная разработка

### 3.1. Пошаговый запуск (если нужно по частям)

```bash
# Шаг 1 — инфраструктура
docker compose -f docker-compose.yml up -d db minio

# Шаг 2 — бакет MinIO
docker compose -f docker-compose.yml up createbuckets

# Шаг 3 — Next.js dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web
```

### 3.2. Что делает dev-контейнер `web-dev`

- `npm install` → `prisma migrate deploy` (или `db push`) → `npm run dev`
- `NODE_ENV=development`, hot reload через polling
- `DATABASE_URL` внутри контейнера: `postgres://postgres:postgres@db:5432/postgres`
- порт БД с хоста: `localhost:5432` → `db:5432` (из `docker-compose.yml`)

### 3.3. Логи и env

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f web

docker exec -it web-dev sh -lc \
  'env | grep -E "DATABASE_URL|S3_ENDPOINT|S3_BUCKET|S3_PUBLIC_URL|NEXTAUTH_URL"'
```

### 3.4. Остановка (данные сохраняются)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

---

## 4. Стенд (сервер)

### 4.1. Запуск

```bash
docker compose -f docker-compose.yml up -d
```

### 4.2. Проверка

```bash
docker compose -f docker-compose.yml ps
docker logs -f web-stage
```

### 4.3. Обновление после `git pull`

```bash
docker compose -f docker-compose.yml up -d web
```

Контейнер `web-stage` при старте сам выполняет: deps → `prisma generate` → `migrate deploy` → `next build` → `npm run start`.

### 4.4. Остановка (данные сохраняются)

```bash
docker compose -f docker-compose.yml down
```

### 4.5. `.env` на сервере

Отличия от локального `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres
NEXTAUTH_URL=https://<ваш-домен>
NEXT_PUBLIC_URL=https://<ваш-домен>
TEST_ENV_BASE_URL=https://<ваш-домен>
S3_PUBLIC_URL=https://<публичный-url-бакета>/images
```

> В базовом compose `DATABASE_URL` не переопределяется — на стенде в `.env` обязательно хост `db`, не `localhost`.

---

## 5. Диагностика

### 5.1. Состояние Docker

```bash
docker ps -a
docker images
docker volume ls
docker network ls
```

### 5.2. Postgres

```bash
docker logs -n 200 db
docker exec -it db sh -lc 'pg_isready -U postgres'
docker exec -it db psql -U postgres -d postgres
docker exec -it db psql -U postgres -d postgres \
  -c "select now(), current_database(), current_user;"
```

### 5.3. MinIO

```bash
docker logs -n 200 minio
curl http://localhost:9000/minio/health/live
```

Web UI (только локальная разработка): http://localhost:9001 — логин/пароль из `.env`.

На стенде порт `9001` привязан к `127.0.0.1` (консоль с интернета недоступна). При необходимости — SSH-туннель: `ssh -L 9001:127.0.0.1:9001 user@server`.

### 5.4. Бакеты MinIO

```bash
docker compose -f docker-compose.yml logs createbuckets

docker run --rm \
  --network container:minio \
  -e MC_HOST_myminio="http://minio:minio123@127.0.0.1:9000" \
  minio/mc:latest ls myminio

docker run --rm \
  --network container:minio \
  -e MC_HOST_myminio="http://minio:minio123@127.0.0.1:9000" \
  minio/mc:latest ls myminio/images
```

### 5.5. Storage / приложение

```bash
curl -i http://localhost:9000/images/hello.txt
curl -i http://localhost:3000/storage/hello.txt
```

---

## 6. Управление сервисами

### Перезапуск

```bash
# web (локально)
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart web

# web (стенд)
docker compose -f docker-compose.yml restart web

# инфраструктура
docker compose -f docker-compose.yml restart db
docker compose -f docker-compose.yml restart minio
```

---

## 7. Очистка

### 7.1. Проект (контейнеры + volumes)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# volumes вручную, если остались
docker volume rm pet-courses-project_db-data
docker volume rm pet-courses-project_minio-data

# кастомные образы проекта (если есть)
docker rmi local/next-app local/minio local/postgres

docker image prune -a -f
```

### 7.2. Глобальная очистка Docker (осторожно!)

```bash
docker rm -f $(docker ps -aq)
docker rmi -f $(docker images -aq)
docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q | grep -vE 'bridge|host|none')
docker builder prune -a -f
docker system prune -a -f

# полный сброс (контейнеры + образы + volumes + кеш):
# docker system prune -a --volumes -f
```
