/**
 * @fileoverview HTTP OAuth endpoints бота для NextAuth (провайдер `TelegramBot`).
 * @see bot/docs/oauth-flow.md — полная документация flow
 */

import { createHash } from "node:crypto";

import { Router, urlencoded } from "express";
import jwt from "jsonwebtoken";
import { type Payload } from "payload";

import { flowLog } from "../../lib/flow-log";
import { getTokenBodySchema, oauthSchema } from "../../lib/schemas";
import { OauthService } from "../services/oauth";

export const OauthRouter = async (payloadInstance: Payload) => {
  const router = Router();
  const oauthService = new OauthService(payloadInstance);

  router.get("/authorize", async (req, res) => {
    flowLog(
      "2/8",
      "GET /oauth/authorize — браузер пришёл с NextAuth (шаг authorize)",
      { query: req.query },
    );

    const resultParse = oauthSchema.safeParse(req.query);
    if (!resultParse.success) {
      flowLog("2/8", "Ошибка валидации query — неверные параметры authorize", {
        errors: resultParse.error.flatten(),
      });
      return res.status(400).json({ error: resultParse.error.flatten() });
    }

    flowLog(
      "2/8",
      "Query валиден: client_id, redirect_uri, state, code_challenge получены от NextAuth",
      {
        client_id: resultParse.data.client_id,
        redirect_uri: resultParse.data.redirect_uri,
        state: resultParse.data.state,
        code_challenge: resultParse.data.code_challenge,
        code_challenge_method: resultParse.data.code_challenge_method,
      },
    );

    const { client_id, redirect_uri } = resultParse.data;

    const oauthClient = await oauthService.findOauthClient(client_id);

    if (!oauthClient) {
      flowLog("3/8", "OAuth-клиент не найден в oauthClients", { client_id });
      return res.status(400).json({ error: "OAuth client not found" });
    }

    flowLog("3/8", "OAuth-клиент найден в Payload", {
      client_id,
      client_name: oauthClient.client_name,
    });

    const isRedirectUriAllowed = oauthClient.redirect_uris.some(
      (item) => item.uri === redirect_uri,
    );

    if (!isRedirectUriAllowed) {
      flowLog("3/8", "redirect_uri не в whitelist клиента", {
        redirect_uri,
        allowed: oauthClient.redirect_uris.map((u) => u.uri),
      });
      return res.status(400).json({ error: "Redirect URI is not allowed" });
    }

    flowLog("3/8", "redirect_uri разрешён — создаём сессию pending в Mongo");

    const code = await oauthService.createOauthClient({
      ...resultParse.data,
      client_name: oauthClient.client_name,
      client_id: oauthClient.client_id,
    });

    const telegramUrl = `${process.env.TELEGRAM_BOT_URL}?start=${code}`;
    flowLog("4/8", "Сессия создана — редирект пользователя в Telegram", {
      code,
      telegramUrl,
    });

    res.redirect(telegramUrl);
  });

  router.post(
    "/access_token",
    urlencoded({ extended: true }),
    async (req, res) => {
      flowLog(
        "7/8",
        "POST /oauth/access_token — NextAuth (сервер web) обменивает code на token",
        {
          grant_type: req.body?.grant_type,
          code: req.body?.code,
          redirect_uri: req.body?.redirect_uri,
          hasAuthorizationHeader: Boolean(req.header("Authorization")),
        },
      );

      const base64Credential = req.header("Authorization")?.split(" ")[1];

      if (!base64Credential) {
        flowLog(
          "7/8",
          "Нет Authorization: Basic — NextAuth должен слать client_id:client_secret",
        );
        return res.status(401).json({ error: "Invalid client id" });
      }

      const [client_id, client_secret] = Buffer.from(base64Credential, "base64")
        .toString("utf-8")
        .split(":", 2);

      flowLog("7/8", "Расшифровали Basic auth — проверяем клиента", {
        client_id,
        client_secret,
      });

      const bodyResult = getTokenBodySchema.safeParse(req.body);

      if (!bodyResult.success) {
        flowLog("7/8", "Тело запроса не прошло валидацию", {
          errors: bodyResult.error.flatten(),
        });
        return res.status(400).json(bodyResult.error.flatten());
      }

      flowLog(
        "7/8",
        "Тело валидно — code_verifier пришёл из cookie NextAuth (PKCE)",
        {
          code: bodyResult.data.code,
          code_verifier: bodyResult.data.code_verifier,
        },
      );

      const client = await oauthService.findOauthClientBySecret({
        client_id,
        client_secret,
      });

      if (!client) {
        flowLog(
          "7/8",
          "Client not found — client_secret в Payload ≠ BOT_CLIENT_SECRET в .env web?",
          { client_id },
        );
        return res.status(400).json({ error: "Client not found" });
      }

      flowLog("7/8", "Клиент аутентифицирован — ищем подтверждённую сессию");

      const session = await oauthService.getOauthClientSession({
        code: bodyResult.data.code,
        client_id,
      });

      if (!session) {
        flowLog(
          "7/8",
          "Сессия не найдена — возможно пользователь не нажал /start в Telegram (status≠confirmed)",
          { code: bodyResult.data.code },
        );
        return res.status(400).json({ error: "Code not found" });
      }

      flowLog("7/8", "Сессия confirmed найдена", {
        sessionId: session.id,
        expires_at: session.expires_at,
        hasUser: Boolean(session.user),
      });

      if (new Date() > new Date(session.expires_at)) {
        flowLog("7/8", "Сессия просрочена (>15 мин)");
        return res.status(400).json({ error: "Code expired" });
      }

      if (!session.user) {
        flowLog(
          "7/8",
          "В сессии нет user — Telegram /start не сохранил профиль",
        );
        return res.status(400).json({ error: "User not found" });
      }

      const hashChallenge = createHash("sha256")
        .update(bodyResult.data.code_verifier)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const pkceOk = hashChallenge === session.code_challenge;

      flowLog(
        "7/8",
        "Проверка PKCE S256: BASE64URL(SHA256(code_verifier)) vs code_challenge",
        {
          pkceOk,
          storedChallenge: session.code_challenge,
          computedChallenge: hashChallenge,
        },
      );

      if (!pkceOk) {
        return res.status(400).json({ error: "Invalid code_verifier" });
      }

      await oauthService.deleteOauthClient(session.id);
      flowLog("7/8", "PKCE ок — сессия удалена (code одноразовый), выдаём JWT");

      const access_token = jwt.sign(
        JSON.parse(session.user),
        process.env.AUTH_SECRET,
        {
          expiresIn: "1h",
        },
      );

      flowLog("7/8", "access_token выдан — NextAuth пойдёт на /oauth/user", {
        access_token,
      });

      return res.json({ access_token, token_type: "Bearer", expires_in: 3600 });
    },
  );

  router.get("/user", async (req, res) => {
    flowLog(
      "8/8",
      "GET /oauth/user — NextAuth запрашивает профиль по Bearer access_token",
      {
        authorization: req.header("Authorization"),
      },
    );

    const authHeader = req.header("Authorization");
    const access_token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader?.split(" ")[1];

    if (!access_token || !process.env.AUTH_SECRET) {
      flowLog("8/8", "Нет токена или AUTH_SECRET в bot/.env");
      return res.status(401).send("Access Token not found");
    }

    try {
      const profile = jwt.verify(access_token, process.env.AUTH_SECRET);
      flowLog("8/8", "JWT валиден — отдаём профиль Telegram в NextAuth", {
        profile,
      });
      return res.json(profile);
    } catch (error) {
      flowLog("8/8", "JWT невалиден или истёк", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(401).send("Access Token not found");
    }
  });

  return router;
};
