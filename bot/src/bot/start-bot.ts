/**
 * @fileoverview Telegram-бот: шаг [5] — подтверждение входа.
 * @see bot/docs/oauth-flow.md
 */

import payload from "payload";
import { Telegraf } from "telegraf";

import { flowLog } from "../lib/flow-log";

import { OauthService } from "./services/oauth";

export const startBot = async (payloadInstance: typeof payload) => {
  flowLog("init", "Запуск Telegraf long-polling — ждём /start от пользователя");

  const bot = new Telegraf(process.env.BOT_TOKEN);
  const oauthService = new OauthService(payloadInstance);

  bot.start(async (ctx) => {
    if (!ctx.payload) {
      flowLog(
        "5/8",
        "/start без payload — пользователь открыл бота не через deep link ?start=CODE",
      );
      return;
    }

    flowLog(
      "5/8",
      "Telegram /start — пользователь подтверждает вход (deep link с authorize)",
      {
        code: ctx.payload,
        telegramUserId: ctx.from?.id,
        username: ctx.from?.username,
      },
    );

    const session = await oauthService.updateOauthCodeClient({
      code: ctx.payload,
      user: ctx.from,
    });

    if (!session) {
      flowLog(
        "5/8",
        "Сессия не найдена или не pending — истекла или вход начат заново",
        { code: ctx.payload },
      );
      return ctx.reply("Сессия истекла или не найдена - начните вход заново.");
    }

    flowLog("5/8", "Сессия → confirmed, Telegram user сохранён в Mongo", {
      sessionId: session.id,
      client_name: session.client_name,
      status: session.status,
    });

    const link = `${session.redirect_uri}?code=${session.code}&state=${session.state}`;

    flowLog(
      "5/8",
      "Отправляем callback-ссылку на Next.js (нужны code + state для шага 6/8)",
      {
        redirect_uri: session.redirect_uri,
        code: session.code,
        state: session.state,
        link,
      },
    );

    return ctx.reply(
      `Подтвердите вход в систему ${session.client_name}, если все хорошо перейдите по ссылке:\n\n${link}`,
    );
  });

  bot.launch();
  flowLog("init", "Telegram bot.launch() — бот слушает обновления");

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};
