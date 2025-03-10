import { useAppearanceDelay } from "../lib/loading-delay";

import { Spinner } from "./spinner";

export const FullPageSpinner = ({ isLoading }: { isLoading: boolean }) => {
  const isShow = useAppearanceDelay(isLoading);

  if (isShow) {
    return (
      <div className="inset-0 flex items-center justify-center absolute">
        <Spinner
          className="w-10 h-10 text-primary"
          aria-label="Загрузка страницы"
        />
      </div>
    );
  }
};
