/**
 * @fileoverview HTTP OAuth endpoints бота для NextAuth (провайдер `TelegramBot`).
 *
 * Монтируется в `server.ts` как `app.use("/oauth", oauthRouter)`.
 *
 * Три роута = три фазы OAuth 2.0 Authorization Code + PKCE:
 *
 * | Роут               | Метод | Кто вызывает        | Шаг flow |
 * |--------------------|-------|---------------------|----------|
 * | `/oauth/authorize` | GET   | **Браузер**         | [2]–[4]  |
 * | `/oauth/access_token` | POST | **Сервер Next.js** | [7]      |
 * | `/oauth/user`      | GET   | **Сервер Next.js**  | [8]      |
 *
 * Полная схема и коллекции Payload — в {@link ../services/oauth.ts}.
 * Подтверждение в Telegram — в {@link ../start-bot.ts}.
 *
 * ---
 * ## Два URL бота (Docker)
 *
 * NextAuth в корневом `.env` использует **разные** адреса:
 *
 * - `BOT_PUBLIC_URL` (напр. `http://localhost:3001`) — только для **authorize** в браузере.
 * - `AUTHORIZATION_BOT_URL` (напр. `http://bot:3001`) — **token** и **user** из контейнера `web-dev`.
 *
 * Если token/user ходить на `localhost:3001` из контейнера → `ECONNREFUSED`
 * (`localhost` внутри контейнера = сам web, не бот).
 *
 * ---
 * ## GET /oauth/authorize — шаги [2]–[4]
 *
 * 1. NextAuth редиректит **браузер** с query:
 *    `client_id`, `redirect_uri`, `response_type=code`, `state`, `code_challenge`, `code_challenge_method=S256`.
 * 2. Валидация query (`oauthSchema`), поиск клиента в `oauthClients`, whitelist `redirect_uri`.
 * 3. {@link OauthService.createOauthClient} — сессия `pending` в `oauthCodeClient`
 *    (сохраняются state, PKCE challenge, redirect_uri).
 * 4. `302` на `TELEGRAM_BOT_URL?start=<code>` — пользователь подтверждает вход в Telegram.
 *
 * ⚠️ NextAuth **не** вызывает authorize сам с сервера — только отдаёт URL браузеру (спека OAuth).
 *
 * ---
 * ## POST /oauth/access_token — шаг [7]
 *
 * После callback NextAuth (в `web-dev`) обменивает `code` на токен:
 *
 * **Заголовок:** `Authorization: Basic base64(client_id:client_secret)`
 * — credentials из `BOT_CLIENT_ID` / `BOT_CLIENT_SECRET` (.env web).
 * Должны совпадать с записью в Payload `oauthClients` (иначе «Client not found»).
 *
 * **Тело** (`application/x-www-form-urlencoded`):
 * - `grant_type=authorization_code`
 * - `code` — из callback URL (тот же, что в ссылке из Telegram)
 * - `redirect_uri` — callback NextAuth
 * - `code_verifier` — из cookie NextAuth (PKCE), **не** хранится в боте
 *
 * **Проверки по порядку:**
 * 1. client_id + client_secret (Basic auth)
 * 2. сессия `confirmed` + тот же client_id ({@link OauthService.getOauthClientSession})
 * 3. не истёк `expires_at`
 * 4. есть `user` (Telegram JSON с шага /start)
 * 5. PKCE: `BASE64URL(SHA256(code_verifier)) === session.code_challenge`
 * 6. удалить сессию (code одноразовый)
 * 7. выдать JWT `access_token` (payload = Telegram user, секрет `AUTH_SECRET` из `bot/.env`)
 *
 * **PKCE на пальцах:**
 * ```
 * authorize:  в БД кладём code_challenge (публичный отпечаток)
 * token:      из body берём code_verifier (секрет из cookie NextAuth)
 *             пересчитываем SHA256 → base64url → сравниваем с code_challenge
 * ```
 *
 * ---
 * ## GET /oauth/user — шаг [8]
 *
 * NextAuth запрашивает профиль: `Authorization: Bearer <access_token>`.
 * Ожидает JSON с полями для `profile()` в next-auth-config (`id`, `username`, `email`).
 * Сейчас возвращает payload JWT (Telegram `ctx.from`), подписанный на access_token.
 *
 * @see {@link ../../lib/schemas.ts} — zod-схемы query и body
 */

import { createHash } from "node:crypto";

import { Router, urlencoded } from "express";
import jwt from "jsonwebtoken";
import { type Payload } from "payload";

import { getTokenBodySchema, oauthSchema } from "../../lib/schemas";
import { OauthService } from "../services/oauth";

/**
 * Создаёт Express-router с OAuth endpoints.
 *
 * @param payloadInstance — Payload после `init()` (доступ к Mongo)
 */
export const OauthRouter = async (payloadInstance: Payload) => {
  const router = Router();
  const oauthService = new OauthService(payloadInstance);

  /**
   * OAuth 2.0 Authorization Endpoint.
   *
   * Точка входа после клика «Войти через Telegram» на сайте.
   * Вызывается **браузером**, не Next.js-сервером.
   */
  router.get("/authorize", async (req, res) => {
    const resultParse = oauthSchema.safeParse(req.query);
    if (!resultParse.success) {
      return res.status(400).json({ error: resultParse.error.flatten() });
    }

    const { client_id, redirect_uri } = resultParse.data;

    const oauthClient = await oauthService.findOauthClient(client_id);

    if (!oauthClient) {
      return res.status(400).json({ error: "OAuth client not found" });
    }

    const isRedirectUriAllowed = oauthClient.redirect_uris.some(
      (item) => item.uri === redirect_uri,
    );

    if (!isRedirectUriAllowed) {
      return res.status(400).json({ error: "Redirect URI is not allowed" });
    }

    const code = await oauthService.createOauthClient({
      ...resultParse.data,
      client_name: oauthClient.client_name,
      client_id: oauthClient.client_id,
    });

    res.redirect(`${process.env.TELEGRAM_BOT_URL}?start=${code}`);
  });

  /**
   * OAuth 2.0 Token Endpoint.
   *
   * Вызывается **только сервером NextAuth** (контейнер web) после успешного callback.
   * Браузер сюда не ходит.
   */
  router.post(
    "/access_token",
    urlencoded({ extended: true }),
    async (req, res) => {
      const base64Credential = req.header("Authorization")?.split(" ")[1];

      if (!base64Credential) {
        return res.status(401).json({ error: "Invalid client id" });
      }

      const [client_id, client_secret] = Buffer.from(base64Credential, "base64")
        .toString("utf-8")
        .split(":");

      const bodyResult = getTokenBodySchema.safeParse(req.body);

      if (!bodyResult.success) {
        return res.status(400).json(bodyResult.error.flatten());
      }

      const client = await oauthService.findOauthClientBySecret({
        client_id,
        client_secret,
      });

      if (!client) {
        return res.status(400).json({ error: "Client not found" });
      }

      const session = await oauthService.getOauthClientSession({
        code: bodyResult.data.code,
        client_id,
      });

      if (!session) {
        return res.status(400).json({ error: "Code not found" });
      }

      if (new Date() > new Date(session.expires_at)) {
        return res.status(400).json({ error: "Code expired" });
      }

      if (!session.user) {
        return res.status(400).json({ error: "User not found" });
      }

      // S256: code_challenge из authorize должен совпасть с хешем code_verifier из body
      const hashChallenge = createHash("sha256")
        .update(bodyResult.data.code_verifier)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      if (!(hashChallenge === session.code_challenge)) {
        return res.status(400).json({ error: "Invalid code_verifier" });
      }

      await oauthService.deleteOauthClient(session.id);

      const access_token = jwt.sign(
        JSON.parse(session.user),
        process.env.AUTH_SECRET,
        {
          expiresIn: "1h",
        },
      );

      return res.json({ access_token, token_type: "Bearer", expires_in: 3600 });
    },
  );

  /**
   * UserInfo Endpoint для NextAuth.
   *
   * После token NextAuth запрашивает профиль пользователя Bearer-токеном.
   * Ответ маппится в `profile()` провайдера TelegramBot на сайте.
   */
  router.get("/user", async (req, res) => {
    console.log("TOKEN", req.header("Authorization"));
    const access_token = req.header("Authorization").split(" ")[1];
    console.log(
      "jwt.verify(access_token, process.env.AUTH_SECRET)",
      jwt.verify(access_token, process.env.AUTH_SECRET),
    );
    console.log("jwt.decode(access_token)", jwt.decode(access_token));
    if (!access_token || !jwt.verify(access_token, process.env.AUTH_SECRET)) {
      return res.status(401).send("Access Token not found");
    }

    return res.json(jwt.decode(access_token));
  });

  return router;
};
