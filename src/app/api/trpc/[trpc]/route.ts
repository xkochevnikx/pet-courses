import "reflect-metadata";

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { initialInversify } from "@/app/initInversifyContainer";
import { mergeRouters } from "@/shared/lib/trpc/procedure";
import { Controller, sharedRouter } from "@/shared/lib/trpc/server";
import { CreateContext } from "@/shared/types/abstract-classes";

const routers = initialInversify.getAll(Controller).map((c) => c.router);

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "api/trpc",
    req,
    router: mergeRouters(sharedRouter, ...routers),
    createContext: initialInversify.get(CreateContext).createContext,
  });

export { handler as GET, handler as POST };
