import payload from "payload";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

export const startBot = async (payloadInstance: typeof payload) => {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  console.log("🚀 ~ startBot ~ bot:", bot);
  bot.start((ctx) => ctx.reply("Welcome"));
  bot.on(message("text"), (ctx) => ctx.reply("Hello from bot"));
  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};
