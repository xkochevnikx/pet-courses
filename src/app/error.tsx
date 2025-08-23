"use client";
import { useEffect } from "react";

import { Button } from "@/shared/ui/button";

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError catch", error);
  }, [error]);
  return (
    <div className="m-4 p-3 bg-red-100 border border-red-400 rounded">
      <h1 className="text-red-600 text-lg font-bold">Произошла ошибка!</h1>
      <p className="text-red-500">{error.message}</p>
      <Button onClick={() => reset()} className="mt-2">
        Попробовать снова
      </Button>
    </div>
  );
}
