# Pet Courses Platform

**Full-stack платформа для прохождения курсов** — pet-проект, собранный как учебный продакшен: от Feature-Sliced Design и DI до собственного OAuth через Telegram и Docker-стенда с CI/CD.

> Стек и решения ориентированы на то, как устроены современные продуктовые фронтенды и BFF, а не на «демо ради демо».

---

## 1. О проекте (elevator pitch)

|                  |                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Что это**      | Веб-приложение для каталога курсов, профиля пользователя и интерактивной карты обучения   |
| **Зачем**        | Отработать архитектуру, auth, контентный пайплайн, инфраструктуру и интеграции end-to-end |
| **Где смотреть** | Staging: [svt-staging.ru](https://svt-staging.ru) _(при доступности стенда)_              |
| **Формат**       | Next.js App Router + отдельный bot-сервис (Payload CMS + Telegram OAuth)                  |

**Ключевые пользовательские сценарии**

- Вход: Email magic link, GitHub OAuth, **кастомный OAuth через Telegram-бота** (PKCE + state)
- Профиль: аватар в S3-совместимое хранилище (MinIO), редактирование данных, роли USER / ADMIN
- Курсы: список с серверным рендерингом, контент из внешнего Git-репозитория (YAML + JSON Schema)
- Карта курсов: интерактивный граф на React Flow (`@xyflow/react`)

---

## 2. Стек технологий

### Frontend / BFF

| Область   | Технологии                                        |
| --------- | ------------------------------------------------- |
| Framework | **Next.js 15** (App Router, `standalone` output)  |
| UI        | React 18, **Tailwind CSS**, Radix UI, CVA, Lucide |
| Forms     | React Hook Form + Zod                             |
| Data      | **tRPC v11** + TanStack Query                     |
| Auth      | **NextAuth v4** + Prisma Adapter                  |
| Theme     | next-themes                                       |
| Map       | **@xyflow/react**                                 |

### Backend & data

| Область    | Технологии                                          |
| ---------- | --------------------------------------------------- |
| ORM / DB   | **Prisma** → **PostgreSQL 17**                      |
| DI         | **Inversify** (модули entities / features / shared) |
| Storage    | **MinIO** (S3 API, AWS SDK)                         |
| Content    | YAML + **AJV** (JSON Schema) + remote Git content   |
| Logging    | **Pino** + decorator `@loggedMethod`                |
| Validation | Zod (runtime), TypeScript (compile-time)            |

### Bot / IdP (отдельный сервис)

| Область  | Технологии                                                             |
| -------- | ---------------------------------------------------------------------- |
| CMS / DB | **Payload 2** + **MongoDB**                                            |
| HTTP     | Express                                                                |
| Telegram | **Telegraf**                                                           |
| Role     | Кастомный OAuth 2.0 IdP (`/oauth/authorize`, `/access_token`, `/user`) |

### Quality & delivery

| Область       | Технологии                                                      |
| ------------- | --------------------------------------------------------------- |
| Lint / format | ESLint 9 (flat) + Prettier + **eslint-plugin-boundaries** (FSD) |
| Unit          | Jest + Testing Library                                          |
| E2E           | Playwright                                                      |
| Commits       | better-commits                                                  |
| CI/CD         | GitHub Actions → SSH deploy → Docker Compose                    |
| Infra         | Multi-stage Dockerfile, nginx, docker-compose (dev + stage)     |

---

## 3. Архитектура

### 3.1. Feature-Sliced Design (FSD)

Код в `src/` разделён на слои с **жёсткими границами импортов** (ESLint `boundaries`):

```
src/
├── app/          # Next.js routes, providers, DI bootstrap
├── widgets/      # Композиции UI (header, layout)
├── features/     # Пользовательские сценарии
│   ├── auth/
│   ├── courses-list/
│   ├── courses-map/
│   ├── update-profile/
│   └── theme-switcher/
├── entities/     # Домен: user, course
└── shared/       # UI-kit, lib, api, types
```

**Правило:** верхний слой может зависеть только от нижних; между features/entities — через публичные API (`index` / `server-index`).

### 3.2. Dependency Injection (Inversify)

Серверный граф зависимостей собирается в одном месте:

```ts
// src/app/initInversifyContainer.ts
container.load(
  CoursesListModule,
  CourseEntityModule,
  UserEntityModule,
  TrpcModule,
  UpdateProfileModule,
  FileStorageModule,
);
```

- Абстракции (сервисы, контроллеры, storage) биндятся в модулях слоёв
- tRPC-контроллеры и NextAuth-конфиг получают зависимости через DI
- Удобно тестировать и менять реализации (например, file storage) без переписывания фич

### 3.3. tRPC как type-safe API-слой

```
Client (React Query)  →  /api/trpc  →  Controllers (features)
                                      →  Services / Repositories (entities)
                                      →  Prisma / S3 / Content API
```

- `publicProcedure` / `authorizedProcedure` — разделение доступа на уровне процедур
- Контекст сессии собирается фабрикой (`CreateContext`)
- Один контракт типов между клиентом и сервером без ручных DTO

### 3.4. Доменные abilities (CASL-style, лёгкий вариант)

Права не размазаны по UI — проверяются через ability-фабрики:

```ts
createProfileAbility(session).canUpdateProfile(userId);
createUserAbility(session).canGetUser(userId);
```

Роли: `USER` | `ADMIN` (Prisma + session callback NextAuth).

---

## 4. Ключевые продуктовые решения

### 4.1. Auth: три провайдера, один адаптер

| Провайдер       | Как работает                         |
| --------------- | ------------------------------------ |
| **Email**       | Magic link (Nodemailer / SMTP)       |
| **GitHub**      | Стандартный OAuth                    |
| **TelegramBot** | Собственный OAuth IdP на боте + PKCE |

Сессии и аккаунты — в Postgres через `@auth/prisma-adapter`. Кастомный `createUser` через DI-сервис (роль, нормализация данных).

### 4.2. Telegram OAuth (витрина инженерии)

Отдельный сервис `bot/` реализует OAuth 2.0 Authorization Code + **PKCE**:

1. NextAuth редиректит на `/oauth/authorize`
2. Бот создаёт pending-сессию в Mongo (Payload), редирект в `t.me/bot?start=CODE`
3. Пользователь подтверждает вход в Telegram (`/start`)
4. Callback → обмен `code` на token → `/oauth/user` → сессия NextAuth

Детали flow: [`bot/docs/oauth-flow.md`](./bot/docs/oauth-flow.md).

Это показывает: понимание OAuth/PKCE, разделение browser vs server URLs в Docker, работу с IdP и security checks (`state`, `code_challenge`).

### 4.3. Content-as-Code

Контент курсов живёт **вне приложения** (GitHub raw YAML):

- JSON Schema → генерация TypeScript (`upload-content-schema`)
- Парсинг YAML + валидация AJV
- Кеш-стратегия на уровне `ContentApi`
- Манифест → курс → урок — типобезопасный пайплайн

Итог: контент могут править без деплоя фронта; приложение гарантирует контракт схемы.

### 4.4. Файлы и медиа

- Загрузка аватаров через AWS SDK → **MinIO**
- Публичная раздача через Next.js rewrite `/storage/*` → внутренний MinIO
- Изоляция credentials через typed env (`parse-private-env` / `parse-public-env`)

### 4.5. Инфраструктура «как на стенде»

| Сервис                    | Назначение                                                |
| ------------------------- | --------------------------------------------------------- |
| `web`                     | Next.js (dev hot-reload / stage: migrate → build → start) |
| `db`                      | PostgreSQL                                                |
| `minio` + `createbuckets` | S3-хранилище + init bucket                                |
| `mongo` + `bot`           | Payload admin + Telegram OAuth                            |

- Multi-stage **Dockerfile**, non-root user, `output: "standalone"`
- Compose: `docker-compose.yml` + override `docker-compose.dev.yml`
- Deploy: push в `main` → GitHub Actions → SSH → `docker compose up --force-recreate`
- Шпаргалка по Docker: [`docker-command.md`](./docker-command.md)

---

## 5. Структура репозитория

```
pet-courses-project/
├── src/                 # Next.js приложение (FSD)
├── bot/                 # Payload + Express + Telegraf (OAuth IdP)
├── prisma/              # Schema + migrations
├── deploy/nginx/        # Reverse proxy для стенда
├── scripts/             # Генерация типов из content schema
├── tests/               # E2E / интеграционные сценарии
├── docker-compose.yml
├── docker-compose.dev.yml
└── .github/workflows/   # CI + deploy staging
```

---

## 6. Что демонстрирует проект работодателю

| Компетенция                         | Где видно в коде                                     |
| ----------------------------------- | ---------------------------------------------------- |
| Масштабируемая фронтенд-архитектура | FSD + eslint-plugin-boundaries                       |
| Серверный дизайн / DI               | Inversify-модули, абстрактные классы сервисов        |
| Type-safe API                       | tRPC + Zod + Prisma                                  |
| Auth & security                     | NextAuth, PKCE OAuth, abilities по ролям             |
| Интеграции                          | Telegram, S3/MinIO, SMTP, GitHub content             |
| DevOps mindset                      | Docker Compose, multi-stage image, GH Actions deploy |
| Качество                            | ESLint/Prettier, Jest, Playwright, typed env         |
| Документирование сложных flow       | `bot/docs/oauth-flow.md`, `docker-command.md`        |

---

## 7. Быстрый старт

### Требования

- Node.js 20+
- Docker + Docker Compose
- Скопировать `.env.example` → `.env` (и при необходимости `bot/.env`)

### Локально (Docker, рекомендуемый путь)

```bash
# инфраструктура + Next.js с hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web

# опционально: Telegram OAuth
docker compose -f docker-compose.yml up -d mongo bot
```

Приложение: [http://localhost:3000](http://localhost:3000)

### Без Docker (только app)

```bash
npm i
npx prisma migrate dev
npm run dev
```

### Полезные скрипты

| Команда                         | Назначение                               |
| ------------------------------- | ---------------------------------------- |
| `npm run dev`                   | Next.js dev-сервер                       |
| `npm run build` / `start`       | Production build                         |
| `npm run lint` / `lint:types`   | ESLint + `tsc --noEmit`                  |
| `npm test`                      | Jest                                     |
| `npm run test:e2e`              | Playwright                               |
| `npm run upload-content-schema` | Обновить TS-типы контента из schema-репо |

Подробнее по контейнерам и troubleshooting — в [`docker-command.md`](./docker-command.md).

---

## 8. Дорожная карта (идеи развития)

- [ ] Полноценный viewer уроков и прогресс прохождения
- [ ] Расширение ability-слоя и admin-панели курсов
- [ ] Включение Playwright в CI после стабилизации стенда
- [ ] Observability: структурированные метрики / error tracking

---

## Контакты / контекст

Pet-проект для портфолио: показывает не только UI, но и **системное мышление** — границы модулей, контракты API, auth, контент, хранилище и деплой как единый продукт.
`)
