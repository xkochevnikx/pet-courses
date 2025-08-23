import { ContainerModule } from "inversify";

import { Controller } from "@/shared/lib/trpc/abstract-controllers";

import { UpdateProfileController } from "./controller";

export const UpdateProfileModule = new ContainerModule((bind) => {
  bind(Controller).to(UpdateProfileController);
});
