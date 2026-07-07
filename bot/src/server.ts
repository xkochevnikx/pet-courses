import dotenv from "dotenv";
import express from "express";
import payload from "payload";
import pinoHttp from "pino-http";

import { OauthRouter } from "./bot/controllers/oauth";
import { startBot } from "./bot/start-bot";
import { flowLog } from "./lib/flow-log";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  pinoHttp({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
);

const start = async () => {
  flowLog("init", "Старт bot-сервера: Payload → Telegram → OAuth routes");

  const payloadInstance = await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  flowLog("init", "Payload готов — подключаем Telegram и /oauth");

  await startBot(payloadInstance); // не бросает при недоступности Telegram API

  const oauthRouter = await OauthRouter(payloadInstance);

  app.use("/oauth", oauthRouter);
  flowLog(
    "init",
    "Роуты смонтированы: /oauth/authorize, /oauth/access_token, /oauth/user",
  );

  app.listen(PORT, () => {
    flowLog("init", `HTTP сервер слушает порт ${PORT}`);
    payload.logger.info(`Server listening on port ${PORT}`);
  });
};

start();
