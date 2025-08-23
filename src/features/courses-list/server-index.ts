import { ContainerModule } from "inversify";

import { Controller } from "@/shared/lib/trpc/abstract-controllers";

import { CoursesListController } from "./controller";

export { CoursesListServer } from "./ui/courses-list-server";

export const CoursesListModule = new ContainerModule((bind) => {
  bind(Controller).to(CoursesListController);
});
