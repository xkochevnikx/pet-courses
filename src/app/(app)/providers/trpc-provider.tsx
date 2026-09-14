import { QueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useState } from "react";

import { baseConfig, trpc } from "@/shared/lib/trpc/client";

export const TrpcProvider: FC<{ children: ReactNode; client: QueryClient }> = ({
  children,
  client,
}) => {
  const [queryClient] = useState(client);
  const [trpcClient] = useState(() =>
    trpc.createClient({
      ...baseConfig,
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
};
