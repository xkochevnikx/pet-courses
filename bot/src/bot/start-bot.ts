/**
 * @fileoverview Telegram-бот: шаг подтверждения входа в OAuth-flow.
 *
 * Этот файл закрывает **шаг [5]** общего flow (см. JSDoc в `services/oauth.ts`).
 * До сюда пользователь уже прошёл authorize на боте и попал в Telegram по deep link.
 *
 * ---
 * ## Что происходит до вызова `/start`
 *
 * 1. Пользователь на сайте жмёт «Войти через Telegram» (NextAuth).
 * 2. Браузер открывает `GET /oauth/authorize` на боте — создаётся сессия `pending` в Mongo.
 * 3. Бот редиректит на `TELEGRAM_BOT_URL?start=<code>`.
 * 4. Пользователь нажимает Start в Telegram — сюда приходит `code` как `ctx.payload`.
 *
 * ---
 * ## Что делает обработчик `/start`
 *
 * 1. {@link OauthService.updateOauthCodeClient} — привязывает Telegram-аккаунт к сессии,
 *    переводит `pending` → `confirmed`.
 * 2. Собирает callback-ссылку на Next.js:
 *    `{redirect_uri}?code={session.code}&state={session.state}`
 * 3. Отправляет ссылку пользователю в чат (plain text URL — Telegram сам делает её кликабельной).
 *
 * ---
 * ## Важные нюансы (из отладки)
 *
 * ### `state` обязателен в ссылке
 * NextAuth на шаге callback сверяет `state` из URL с cookie `next-auth.state`.
 * Без `state` в ссылке: `OAuthCallbackError: state missing from the response`.
 *
 * ### Открывать ссылку в том же браузере, где начали вход
 * `code_verifier` (PKCE) лежит в cookie NextAuth. Если открыть callback в другом
 * браузере / Telegram in-app browser — token exchange на шаге [7] упадёт.
 *
 * ### Почему не HTML `<a href>` и не inline-кнопка с localhost
 * - `<a href="http://localhost…">` в Telegram часто не кликается.
 * - Inline URL-кнопки Telegram требуют HTTPS; для dev — полный URL текстом.
 *
 * ### `code` в Telegram ≠ отдельный «внутренний» код
 * Один и тот же `session.code` используется и в `?start=`, и в callback `?code=` для NextAuth.
 *
 * ---
 * ## Env (`bot/.env`)
 *
 * - `BOT_TOKEN` — токен @BotFather
 * - `TELEGRAM_BOT_URL` — публичная ссылка на бота, напр. `https://t.me/your_bot`
 *
 * @see {@link ./services/oauth.ts} — полная схема flow и работа с Payload
 * @see {@link ./controllers/oauth.ts} — `/oauth/authorize` и `/oauth/access_token`
 */

import payload from "payload";
import { Telegraf } from "telegraf";

import { OauthService } from "./services/oauth";

/**
 * Запускает long-polling Telegram-бота и регистрирует OAuth-обработчик `/start`.
 *
 * Вызывается из `server.ts` после `payload.init()` — нужен живой Payload для сессий.
 *
 * @param payloadInstance — инициализированный Payload (Mongo)
 * @returns экземпляр Telegraf (для graceful shutdown в server.ts)
 */
export const startBot = async (payloadInstance: typeof payload) => {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const oauthService = new OauthService(payloadInstance);

  /**
   * Deep link: `https://t.me/Bot?start=<code>`
   *
   * `ctx.payload` = `<code>` — ключ сессии в коллекции `oauthCodeClient`.
   * Без payload (просто /start без аргумента) — игнорируем.
   */
  bot.start(async (ctx) => {
    if (!ctx.payload) return;

    const session = await oauthService.updateOauthCodeClient({
      code: ctx.payload,
      user: ctx.from,
    });

    if (!session) {
      return ctx.reply("Сессия истекла или не найдена - начните вход заново.");
    }

    // redirect_uri и state сохранены на шаге authorize из query NextAuth
    const link = `${session.redirect_uri}?code=${session.code}&state=${session.state}`;

    return ctx.reply(
      `Подтвердите вход в систему ${session.client_name}, если все хорошо перейдите по ссылке:\n\n${link}`,
    );
  });

  bot.launch();

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};
