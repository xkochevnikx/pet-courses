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

/** Человекочитаемый разбор ошибок Telegraf / node-fetch к api.telegram.org */
export const formatTelegramConnectError = (
  error: unknown,
): Record<string, unknown> => {
  if (!(error instanceof Error)) {
    return { detail: String(error) };
  }

  const errno = error as Error & { code?: string };
  const reasonMatch = error.message.match(/reason: (.+)$/);
  const reason = reasonMatch?.[1] ?? errno.code ?? error.message;

  const networkBlocked =
    errno.code === "ETIMEDOUT" ||
    errno.code === "ECONNREFUSED" ||
    errno.code === "ENOTFOUND" ||
    /ETIMEDOUT|ECONNREFUSED|ENOTFOUND/.test(reason);

  return {
    reason,
    code: errno.code,
    errorName: error.name,
    hint: networkBlocked
      ? "Нет доступа к api.telegram.org с сервера (часто блокировка из РФ) — нужен SOCKS/VPN для бота"
      : "Проверьте BOT_TOKEN в bot/.env и доступ к https://api.telegram.org",
  };
};
