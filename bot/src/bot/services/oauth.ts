/**
 * @fileoverview Сервис OAuth-сессий бота (Payload / MongoDB).
 *
 * Этот модуль — **слой данных** для кастомного OAuth-провайдера TelegramBot в NextAuth.
 * HTTP-роуты живут в `controllers/oauth.ts`, Telegram — в `start-bot.ts`.
 *
 * ---
 * ## Две коллекции в Payload (не путать!)
 *
 * | Коллекция        | Что хранит                         | Живёт как долго      |
 * |------------------|------------------------------------|----------------------|
 * | `oauthClients`   | Зарегистрированные OAuth-клиенты   | Постоянно (админка)  |
 * |                  | (`client_id`, `client_secret`,     |                      |
 * |                  |  whitelist `redirect_uris`)        |                      |
 * | `oauthCodeClient`| **Одна попытка входа** (сессия)    | ~15 мин, одноразово  |
 * |                  | PKCE, state, Telegram user, code   |                      |
 *
 * `oauthClients` — «кто имеет право использовать бота как IdP» (наш Next.js).
 * `oauthCodeClient` — «конкретный вход пользователя X прямо сейчас».
 *
 * ---
 * ## Полный flow (8 шагов) — кто, куда, зачем
 *
 * ```
 * [1] Браузер → Next.js: «Войти через Telegram»
 *     NextAuth создаёт state + code_verifier (PKCE), кладёт в cookies браузера.
 *
 * [2] Браузер → GET /oauth/authorize (бот, BOT_PUBLIC_URL)
 *     Query: client_id, redirect_uri, state, code_challenge, code_challenge_method=S256
 *     ⚠️ Идёт БРАУЗЕР, не сервер Next.js (OAuth Authorization Code spec).
 *
 * [3] Бот: findOauthClient + проверка redirect_uri → createOauthClient()
 *     Сохраняет сессию status=pending, code_challenge, state, redirect_uri…
 *     Возвращает одноразовый `code` (это НЕ финальный OAuth code для NextAuth — см. ниже).
 *
 * [4] Браузер → Telegram: t.me/Bot?start=<code>
 *     `code` в deep link = ключ сессии в `oauthCodeClient`, не путать с OAuth authorization code.
 *
 * [5] Telegram → бот /start <code>  →  updateOauthCodeClient()  (start-bot.ts)
 *     Пишет JSON Telegram-пользователя, status=confirmed.
 *     Отправляет ссылку: redirect_uri?code=<session.code>&state=<session.state>
 *     ⚠️ В URL обязателен state — иначе NextAuth: "state missing from the response".
 *
 * [6] Браузер → GET /api/auth/callback/TelegramBot?code=…&state=…  (Next.js)
 *     NextAuth сверяет state из URL с cookie.
 *
 * [7] Сервер web-dev → POST /oauth/access_token (бот, AUTHORIZATION_BOT_URL=http://bot:3001)
 *     Body: code, code_verifier, redirect_uri, grant_type
 *     Header: Authorization: Basic base64(client_id:client_secret)
 *     ⚠️ Идёт из КОНТЕЙНЕРА Next.js, поэтому localhost:3001 не работает — только bot:3001.
 *     Бот: getOauthClientSession → PKCE (SHA256+base64url) → JWT access_token → delete сессии.
 *
 * [8] Сервер web-dev → GET /oauth/user + Bearer access_token
 *     NextAuth читает профиль → создаёт сессию на сайте.
 * ```
 *
 * ---
 * ## PKCE (зачем code_challenge в БД, а code_verifier в POST)
 *
 * - На шаге [2] NextAuth шлёт **публичный** `code_challenge = BASE64URL(SHA256(code_verifier))`.
 * - **Секретный** `code_verifier` остаётся в cookie браузера до шага [7].
 * - На token бот пересчитывает challenge из verifier и сравнивает с сохранённым в сессии.
 * - Так нельзя обменять перехваченный `code` без знания verifier.
 *
 * ---
 * ## Env (связанные переменные)
 *
 * - **Корневой `.env` (web):** `BOT_CLIENT_ID`, `BOT_CLIENT_SECRET`, `BOT_PUBLIC_URL`,
 *   `AUTHORIZATION_BOT_URL` — должны совпадать с записью в `oauthClients` (особенно secret!).
 * - **`bot/.env`:** `AUTH_SECRET` — подпись JWT в access_token; `TELEGRAM_BOT_URL`, `BOT_TOKEN`.
 *
 * @see {@link ../start-bot.ts} — шаг [5], подтверждение в Telegram
 * @see {@link ../controllers/oauth.ts} — шаги [3], [7], [8]
 */

import { randomUUID } from "node:crypto";

import { Payload } from "payload";

import type { OauthClient, OauthCodeClient } from "payload/generated-types";

/** Поля сессии входа, которые приходят с /oauth/authorize (без автогенерируемых). */
type CreateOauthClientData = Omit<
  OauthCodeClient,
  "id" | "code" | "updatedAt" | "createdAt" | "status" | "expires_at"
>;

/** TTL одноразовой сессии входа (15 минут — типичный срок для OAuth authorization code). */
const SESSION_TTL_MS = 15 * 60 * 1000;

/**
 * Доступ к OAuth-данным в Payload.
 *
 * Не знает про Express/Telegram — только find/create/update/delete в Mongo.
 */
export class OauthService {
  constructor(private payloadInstance: Payload) {
    this.payloadInstance = payloadInstance;
  }

  /**
   * Шаг [3]: найти зарегистрированного OAuth-клиента по `client_id`.
   *
   * Вызывается на `/oauth/authorize` до создания сессии.
   * Проверяет, что запрос от известного приложения (наш Next.js с `client_id=svt`).
   *
   * @param client_id — из query NextAuth (`BOT_CLIENT_ID` в .env)
   * @returns документ `oauthClients` или `undefined`, если не найден
   */
  async findOauthClient(client_id: string) {
    const { docs } = await this.payloadInstance.find({
      collection: "oauthClients",
      where: {
        client_id: {
          equals: client_id,
        },
      },
      limit: 1,
    });

    return docs[0] as unknown as OauthClient;
  }

  /**
   * Шаг [7]: проверить пару `client_id` + `client_secret` на token endpoint.
   *
   * NextAuth шлёт credentials в `Authorization: Basic …` при POST /oauth/access_token.
   * **Secret в Payload Admin должен совпадать с `BOT_CLIENT_SECRET` в .env web** —
   * иначе «Client not found» / invalid client на callback.
   *
   * @returns документ `oauthClients` или `undefined`
   */
  async findOauthClientBySecret({
    client_id,
    client_secret,
  }: {
    client_id: string;
    client_secret: string;
  }) {
    const { docs } = await this.payloadInstance.find({
      collection: "oauthClients",
      where: {
        client_id: {
          equals: client_id,
        },
        client_secret: {
          equals: client_secret,
        },
      },
    });

    return docs[0] as unknown as OauthClient;
  }

  /**
   * Шаг [3]: создать одноразовую сессию входа после валидации authorize.
   *
   * Генерирует внутренний `code` (ключ для Telegram `?start=` и для OAuth callback).
   * Сохраняет из query NextAuth: `state`, `code_challenge`, `code_challenge_method`,
   * `redirect_uri`, `client_id` — всё нужно на шагах [5] и [7].
   *
   * @param data — поля authorize-запроса + client_name из oauthClients
   * @returns сгенерированный `code` для редиректа в Telegram
   */
  async createOauthClient(data: CreateOauthClientData) {
    const code = randomUUID().replace(/-/g, "").slice(0, 32);
    await this.payloadInstance.create({
      collection: "oauthCodeClient",
      data: {
        ...data,
        code,
        status: "pending",
        expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      },
    });
    return code;
  }

  /**
   * Шаг [7]: удалить использованную сессию после выдачи access_token.
   *
   * Authorization code одноразовый — повторный обмен тем же `code` должен быть невозможен.
   */
  async deleteOauthClient(id: string) {
    await this.payloadInstance.delete({
      collection: "oauthCodeClient",
      id,
    });
  }

  /**
   * Найти сессию по внутреннему `code` (ключ из Telegram deep link).
   *
   * Используется в:
   * - {@link updateOauthCodeClient} (шаг [5]) — по `ctx.payload` из `/start`
   * - косвенно при проверке TTL
   *
   * Если `expires_at` в прошлом — удаляет документ и возвращает `null`.
   */
  async getOauthClientByCode(code: string): Promise<OauthCodeClient | null> {
    const doc = await this.payloadInstance
      .find({
        collection: "oauthCodeClient",
        where: { code: { equals: code } },
        limit: 1,
        pagination: false,
      })
      .then((res) => res.docs[0]);

    if (!doc) return null;

    const client = doc as unknown as OauthCodeClient;

    if (new Date(client.expires_at) < new Date()) {
      await this.payloadInstance.delete({
        collection: "oauthCodeClient",
        id: client.id,
      });

      return null;
    }

    return client;
  }

  /**
   * Шаг [7]: сессия готова к обмену code → token.
   *
   * Условия: тот же `code` + `client_id`, **status = confirmed**
   * (пользователь уже нажал /start в Telegram на шаге [5]).
   *
   * Если пользователь не подтвердил вход в боте — вернёт пустой результат → «Code not found».
   */
  async getOauthClientSession({
    code,
    client_id,
  }: {
    code: string;
    client_id: string;
  }): Promise<OauthCodeClient | null> {
    const session = await this.payloadInstance
      .find({
        collection: "oauthCodeClient",
        where: {
          code: { equals: code },
          client_id: { equals: client_id },
          status: { equals: "confirmed" },
        },
      })
      .then((res) => res.docs[0]);

    return session as unknown as OauthCodeClient;
  }

  /**
   * Шаг [5]: пользователь подтвердил вход в Telegram.
   *
   * 1. Ищет сессию по `code` из `?start=<code>` (должна быть `pending`, не просрочена).
   * 2. Сохраняет `user` (JSON `ctx.from` Telegraf: id, username, …).
   * 3. Ставит `status: confirmed` — после этого доступен обмен на token.
   *
   * @param code — payload команды /start (тот же code, что ушёл в Telegram на шаге [4])
   * @param user — объект Telegram User из Telegraf
   * @returns обновлённая сессия или `null` (истекла / уже использована / не найдена)
   */
  async updateOauthCodeClient({ code, user }) {
    const session = await this.getOauthClientByCode(code);

    if (!session || session.status !== "pending") return null;

    await this.payloadInstance.update({
      collection: "oauthCodeClient",
      id: session.id,
      data: {
        user: JSON.stringify(user),
        status: "confirmed",
      },
    });

    return await this.getOauthClientByCode(code);
  }
}
