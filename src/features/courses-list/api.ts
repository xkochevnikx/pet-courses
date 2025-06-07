import { createApi, createHttpServerApi } from "@/kernel/lib/trpc/client";

import { CoursesListController } from "./controller";

export const coursesListApi = createApi<CoursesListController>();

export const coursesListApiServer =
  createHttpServerApi<CoursesListController>();
