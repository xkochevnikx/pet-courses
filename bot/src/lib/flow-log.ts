import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({
  colorize: true,
  translateTime: "HH:MM:ss",
  ignore: "pid,hostname",
  singleLine: false,
});

const logger = pino({ level: "info" }, stream);

/**
 * Пошаговый лог OAuth-flow.
 *
 * @param step — номер шага из docs/oauth-flow.md, напр. "3/8"
 * @param message — что происходит человеческим языком
 * @param data — дополнительный контекст для отладки
 */
export const flowLog = (
  step: string,
  message: string,
  data?: Record<string, unknown>,
) => {
  logger.info({ step, ...data }, `[OAuth flow ${step}] ${message}`);
};
