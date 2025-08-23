import { createApi, createHttpServerApi } from "@/shared/lib/trpc/client";

import { CoursesListController } from "./controller";

export const coursesListApi = createApi<CoursesListController["router"]>();

export const coursesListApiServer =
  createHttpServerApi<CoursesListController["router"]>();
