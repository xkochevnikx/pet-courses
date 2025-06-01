import { logger } from "./pino-config";

export function loggedMethod({
  msg,
  logArgs,
  logRes,
}: {
  msg?: string;
  logArgs?: (...args: any[]) => unknown;
  logRes?: (res: any, ...args: any[]) => unknown;
}) {
  return function async(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      logger.info({
        methodName: String(propertyKey),
        args: logArgs?.(...args),
        msg: `Call ${String(propertyKey)}: ${msg ?? ""}`,
      });

      try {
        const result = await originalMethod.apply(this, args);

        logger.info({
          methodName: String(propertyKey),
          data: logRes?.(result, ...args),
          msg: `Result ${String(propertyKey)}: ${msg ?? ""}`,
        });

        return result;
      } catch (error) {
        logger.error({
          methodName: String(propertyKey),
          error,
          msg: `Error ${String(propertyKey)}: ${msg ?? ""}`,
        });
      }
    };
  };
}
