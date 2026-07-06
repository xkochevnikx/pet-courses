import dotenv from "dotenv";
import express from "express";
import payload from "payload";
import pinoHttp from "pino-http";

import { OauthRouter } from "./bot/controllers/oauth";
import { startBot } from "./bot/start-bot";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3002;

// Redirect root to Admin panel
// app.get("/", (_, res) => {
//   res.redirect("/admin");
// });

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
  // Initialize Payload
  const payloadInstance = await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  await startBot(payloadInstance);

  const oauthRouter = await OauthRouter(payloadInstance);

  app.use("/oauth", oauthRouter);

  // Add your own express routes here

  app.listen(PORT, () => {
    payload.logger.info(`Server listening on port ${PORT}`);
  });
};

start();
