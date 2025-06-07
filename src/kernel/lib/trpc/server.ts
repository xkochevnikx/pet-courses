import { initTRPC } from "@trpc/server";

import { getAppSessionServer } from "../next-auth/get-session-server";

export const createContext = async () => {
  const session = await getAppSessionServer();

  return {
    session,
  };
};

export const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;

const middleware = t.middleware;

export const sharedRouter = router({});

export const mergeRouters = t.mergeRouters;

export type SharedRouter = typeof sharedRouter;

const testProcedure = middleware(({ ctx, next }) => {
  console.log("middleware", ctx.session?.user);

  return next({});
});

export const publicProcedure = t.procedure.use(testProcedure);
