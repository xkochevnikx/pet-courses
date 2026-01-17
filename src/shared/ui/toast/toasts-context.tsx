import { nanoid } from "nanoid";
import { ReactNode, useState } from "react";

import { createStrictContext, useStrictContext } from "../../lib/react";

import { ToastsContainer } from "./toasts-container";
import { Toast, ToastContextType, ToastParams, ToastsConfig } from "./types";

export const toastsContext = createStrictContext<ToastContextType>();

export const useToast = () => {
  return useStrictContext(toastsContext);
};

export function ToastContext({
  children,
  config,
}: {
  children?: ReactNode;
  config: ToastsConfig;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToasts = ({
    type,
    message,
    lifeTime = config.lifeTime,
    onRemove,
  }: ToastParams) => {
    const removeToast = (id: string) => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    };

    const id = nanoid();

    const newToast: Toast = {
      id,
      type,
      message,
      timeout: setTimeout(() => {
        removeToast(id);
        onRemove?.();
      }, lifeTime) as unknown as number,
      onRemove: () => {
        clearTimeout(newToast.timeout);
        removeToast(id);
        onRemove?.();
      },
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  return (
    <toastsContext.Provider value={{ addToasts }}>
      <ToastsContainer toasts={toasts} />

      {children}
    </toastsContext.Provider>
  );
}
