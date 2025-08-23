import { ContainerModule } from "inversify";

import { CreateContext } from "@/shared/types/abstract-classes";

import { CreateContextImp } from "./context-factory";

export {
  authorizedProcedure,
  // checkAbilityInputProcedure,
  // checkAbilityProcedure,
  // createPublicServerApi,
  publicProcedure,
  router,
  sharedRouter,
  t,
  type SharedRouter,
} from "./procedure";

export { Controller } from "./abstract-controllers";

export const TrpcModule = new ContainerModule((bind) => {
  bind(CreateContext).to(CreateContextImp);
});
