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

| Сервис          | Контейнер               | Назначение                             |
| --------------- | ----------------------- | -------------------------------------- |
| `db-sessions`   | `db-sessions`           | Postgres: Prisma / NextAuth (юзеры)    |
| `db-courses`    | `db-courses`            | Postgres: Payload 3 CMS (курсы)        |
| `minio`         | `minio`                 | S3-совместимое хранилище               |
| `createbuckets` | `createbuckets`         | One-shot: создаёт бакет в MinIO        |
| `web`           | `web-dev` / `web-stage` | Next.js + Payload 3 CMS                |
| `mongo`         | `mongo`                 | MongoDB для bot / Payload 2            |
| `bot`           | `bot`                   | Payload 2 + Express (OAuth / Telegram) |

**Два отдельных Postgres-контейнера:**

| Контейнер     | Database   | Env                    | Порт с хоста | В Docker-сети      |
| ------------- | ---------- | ---------------------- | ------------ | ------------------ |
| `db-sessions` | `sessions` | `DATABASE_URL`         | `5432`       | `db-sessions:5432` |
| `db-courses`  | `courses`  | `PAYLOAD_DATABASE_URL` | `5433`       | `db-courses:5432`  |

`db-init` больше не нужен: у каждого контейнера свой `POSTGRES_DB` и свой volume.

**Compose-файлы:**

| Файл                     | Где используется | Что делает                                                        |
| ------------------------ | ---------------- | ----------------------------------------------------------------- |
| `docker-compose.yml`     | стенд + база     | db-sessions, db-courses, minio, createbuckets, web, mongo, bot    |
| `docker-compose.dev.yml` | только локально  | override только для `web` → `web-dev` (hot reload, dev env + URL) |

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

Поднимает db-sessions → db-courses → minio → createbuckets → web-dev на `localhost:3000`. Сервисы `mongo` и `bot` — из базового compose (поднять отдельно: `up -d mongo bot`).

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web
```

### Стенд — одной командой

Поднимает db-sessions → db-courses → minio → createbuckets → web-stage (migrate → build → start).

```bash
docker compose -f docker-compose.yml up -d
```

---

## 3. Локальная разработка

### 3.1. Пошаговый запуск (если нужно по частям)

```bash
# Шаг 1 — два Postgres
docker compose -f docker-compose.yml up -d db-sessions db-courses

# Шаг 2 — MinIO
docker compose -f docker-compose.yml up -d minio
docker compose -f docker-compose.yml up createbuckets

# Шаг 3 — Next.js dev (+ Payload 3)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web
```

### 3.2. Что делает dev-контейнер `web-dev`

- зависит от `db-sessions` и `db-courses` (оба healthy)
- `npm install` → `prisma migrate deploy` (или `db push`) → `npm run dev`
- `NODE_ENV=development`, hot reload через polling
- внутри контейнера (из `docker-compose.dev.yml`):
  - `DATABASE_URL=postgres://postgres:postgres@db-sessions:5432/sessions`
  - `PAYLOAD_DATABASE_URL=postgres://postgres:postgres@db-courses:5432/courses`
- с хоста: sessions `localhost:5432`, courses `localhost:5433`
- CMS админка корневого web: http://localhost:3000/admin  
  (это **не** Payload 2 бота на `:3001`)

### 3.3. Логи и env

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f web

docker exec -it web-dev sh -lc \
  'env | grep -E "DATABASE_URL|PAYLOAD_DATABASE_URL|PAYLOAD_SECRET|S3_ENDPOINT|S3_BUCKET|S3_PUBLIC_URL|NEXTAUTH_URL"'
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
# Локально в .env — 127.0.0.1 + порты 5432/5433.
# В web-stage / web-dev URL переопределяются на db-sessions / db-courses.
PAYLOAD_SECRET=<длинная-случайная-строка>

NEXTAUTH_URL=https://<ваш-домен>
NEXT_PUBLIC_URL=https://<ваш-домен>
TEST_ENV_BASE_URL=https://<ваш-домен>
S3_PUBLIC_URL=https://<публичный-url-бакета>/images

# OAuth Telegram Bot
BOT_PUBLIC_URL=https://svt-staging.ru
AUTHORIZATION_BOT_URL=http://bot:3001
BOT_CLIENT_ID=svt
BOT_CLIENT_SECRET=<как в Payload oauthClients>
```

> `BOT_PUBLIC_URL` — URL для **браузера** (authorize через nginx).  
> `AUTHORIZATION_BOT_URL` — URL для **контейнера web** → `bot:3001` (token/user).

> В compose у `web` уже прописаны `DATABASE_URL` / `PAYLOAD_DATABASE_URL` на `db-sessions` / `db-courses`. В `.env` для IDE/хоста оставляй `127.0.0.1:5432` и `127.0.0.1:5433`.

### 4.6. Nginx: бот + Payload Admin + OAuth

Бот на `127.0.0.1:3001`. Готовый конфиг: **`deploy/nginx/bot-payload.conf`**

| Путь                                 | Куда      | Назначение                        |
| ------------------------------------ | --------- | --------------------------------- |
| `/admin`                             | bot :3001 | Payload **2** Admin (бот / OAuth) |
| `/api/users`, `/api/oauthClients`, … | bot :3001 | Payload 2 API                     |
| `/oauth/`                            | bot :3001 | OAuth Telegram                    |
| `/api/auth/`, `/api/trpc/`           | web :3000 | Next.js                           |
| `/`                                  | web :3000 | сайт                              |

> В корневом Next тоже есть Payload **3** (`/admin` на `:3000`). На стенде nginx сейчас отдаёт `/admin` на **bot**. Локально CMS курсов: `http://localhost:3000/admin`. Маршрутизацию стенда при необходимости развести отдельно (разные пути / поддомены).

В `bot/.env` на стенде:

```env
PAYLOAD_PUBLIC_URL=https://svt-staging.ru
```

```bash
sudo nginx -t && sudo systemctl reload nginx
docker compose -f docker-compose.yml restart bot
```

Проверка:

```bash
curl -sI https://svt-staging.ru/admin | head -3
curl -sI "https://svt-staging.ru/oauth/authorize?client_id=x" | head -3
```

Админка: https://svt-staging.ru/admin — первый пользователь: `/admin/create-first-user`.

> **Безопасность:** админка публична — сильный пароль; опционально basic auth в nginx (см. комментарий в `bot-payload.conf`).

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
docker logs -n 200 db-sessions
docker logs -n 200 db-courses

docker exec -it db-sessions sh -lc 'pg_isready -U postgres -d sessions'
docker exec -it db-courses sh -lc 'pg_isready -U postgres -d courses'

# Prisma / sessions
docker exec -it db-sessions psql -U postgres -d sessions \
  -c "select now(), current_database(), current_user;"

# Payload / courses
docker exec -it db-courses psql -U postgres -d courses \
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
docker compose -f docker-compose.yml restart db-sessions
docker compose -f docker-compose.yml restart db-courses
docker compose -f docker-compose.yml restart minio
```

---

## 7. Очистка

### 7.1. Проект (контейнеры + volumes)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# volumes вручную, если остались
docker volume rm pet-courses-project_db-sessions-data
docker volume rm pet-courses-project_db-courses-data
docker volume rm pet-courses-project_minio-data
# старый volume одного Postgres (если остался после миграции на два контейнера):
# docker volume rm pet-courses-project_db-data

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
