import { injectable } from "inversify";

import { Controller, publicProcedure, router } from "@/shared/lib/trpc/server";
import { GetCoursesListService } from "@/shared/types/abstract-classes";

@injectable()
export class CoursesListController extends Controller {
  constructor(private getCoursesListService: GetCoursesListService) {
    super();
  }
  public router = router({
    coursesList: router({
      get: publicProcedure.query(async () => {
        return await this.getCoursesListService.exec();
      }),
    }),
  });
}
