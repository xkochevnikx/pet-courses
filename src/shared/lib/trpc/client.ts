import {
  createTRPCClient,
  CreateTRPCReact,
  createTRPCReact,
  httpBatchLink,
  TRPCClient,
} from "@trpc/react-query";
import { AnyRouter } from "@trpc/server";

import { publicEnv } from "@/shared/lib/env/parse-public-env";

import { SharedRouter } from "./server";

export const trpc = createTRPCReact<SharedRouter>();

export const createApi = <T extends AnyRouter>() =>
  trpc as CreateTRPCReact<T, unknown>;

export const baseConfig = {
  links: [
    httpBatchLink({
      url: `${publicEnv.PUBLIC_URL}/api/trpc`,
    }),
  ],
};

const sharedTrpcApi = createTRPCClient<SharedRouter>({
  ...baseConfig,
});

export const createHttpServerApi = <T extends AnyRouter>() =>
  sharedTrpcApi as TRPCClient<T>;
