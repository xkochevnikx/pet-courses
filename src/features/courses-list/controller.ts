import { getCoursesListService } from "@/entities/course/server-index";
import { publicProcedure, router } from "@/kernel/lib/trpc/server";

export const courseListController = router({
  coursesList: router({
    get: publicProcedure.query(async () => {
      return await getCoursesListService.exec();
    }),
  }),
});

export type CoursesListController = typeof courseListController;
