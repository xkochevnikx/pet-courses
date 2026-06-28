import payload from "payload";
import { Telegraf } from "telegraf";

import { OauthService } from "./services/oauth";

export const startBot = async (payloadInstance: typeof payload) => {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const oauthService = new OauthService(payloadInstance);

  bot.start(async (ctx) => {
    if (!ctx.payload) return;

    const session = await oauthService.updateOauthCodeClient({
      code: ctx.payload,
      user: ctx.from,
    });

    if (!session) {
      return ctx.reply("Сессия истекла или не найдена - начните вход заново.");
    }

    const link = `${session.redirect_uri}?code=${session.code}`;

    return ctx.reply(
      `Подтвердите вход в систему ${session.client_name}, если все хорошо перейдите по ссылке:\n\n${link}`,
    );
  });

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};
