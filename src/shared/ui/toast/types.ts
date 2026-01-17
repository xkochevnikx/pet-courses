export type ToastType = "success" | "error" | "info";

export type ToastParams = {
  type: ToastType;
  message: string;
  lifeTime?: number;
  onRemove?: () => void;
};

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  timeout: number;
  onRemove: () => void;
};

export type ToastsConfig = {
  lifeTime: number;
};

export type ToastContextType = {
  addToasts: (params: ToastParams) => void;
};
