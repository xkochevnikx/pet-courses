import Pino from "pino";

/**
 * Конфигурация логгера на основе Pino.
 *
 * Логгер используется для форматирования и логирования сообщений с указанием времени, уровня логирования и дополнительных данных.
 */

export const logger = Pino({
  /**
   * Настройка форматирования логов.
   */
  formatters: {
    /**
     * Форматирование уровня логирования.
     *
     * @param {string} label - Уровень логирования, передаваемый в лог.
     * @returns {object} - Возвращает объект с уровнем логирования в верхнем регистре.
     *
     * Пример: если уровень `info`, то в логах это будет отображено как `INFO`.
     */
    level: (label) => {
      return { level: label.toUpperCase() };
    },

    /**
     * Форматирование информации о привязках (bindings).
     *
     * @param {object} bindings - Включает информацию о процессе (PID) и имени хоста.
     * @returns {object} - Возвращает объект с идентификатором процесса (pid) и именем хоста (hostname).
     */
    bindings: (bindings) => {
      return { id: bindings.pid, host: bindings.hostname };
    },
  },

  /**
   * Настройка форматирования временной метки.
   *
   * @returns {string} - Возвращает строку с временной меткой в формате `dd.mm.yyyy hh:mm:ss`, что соответствует русской локали.
   *
   * Пример: `"time":"31.12.2023 23:59:59"`
   */
  timestamp: () => {
    const date = new Date();
    const formattedDate = date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `,"time":"${formattedDate}"`;
  },
});
