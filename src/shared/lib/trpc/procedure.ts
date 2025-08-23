import { initTRPC, TRPCError } from "@trpc/server";
import { z, ZodTypeAny } from "zod";

import { SessionEntity } from "@/shared/types/domain-types";

import { CreateContextImp } from "./context-factory";

export const t = initTRPC.context<CreateContextImp["createContext"]>().create();

export const router = t.router;

export const sharedRouter = router({});

export const mergeRouters = t.mergeRouters;

export type SharedRouter = typeof sharedRouter;

export const publicProcedure = t.procedure;

export const authorizedProcedure = <Input extends ZodTypeAny, Ability>({
  schemaParse,
  check,
  create,
}: {
  schemaParse: Input;
  check: (ability: Ability, input: z.infer<Input>) => boolean;
  create: (session: SessionEntity) => Ability;
}) =>
  publicProcedure
    .input(schemaParse)
    .use(({ ctx, next, input: parsedInput }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const ability = create(ctx.session);

      if (!check(ability, parsedInput)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return next({
        ctx: {
          session: ctx.session,
          input: parsedInput,
        },
      });
    });
