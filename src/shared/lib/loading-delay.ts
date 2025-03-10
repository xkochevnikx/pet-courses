import { startTransition, useEffect, useState } from "react";

export const useAppearanceDelay = (
  show?: boolean,
  options = {} as {
    defaultValue: boolean;
    appearanceDelay?: number;
    minDisplay?: number;
  },
) => {
  const {
    defaultValue = false,
    appearanceDelay = 500,
    minDisplay = 500,
  } = options;

  const [delayShow, setDelayShow] = useState(defaultValue);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        startTransition(() => setDelayShow(true));
      }, appearanceDelay);
      return () => clearInterval(timer);
    } else {
      const timer = setTimeout(() => {
        startTransition(() => setDelayShow(false));
      }, minDisplay);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return delayShow;
};
