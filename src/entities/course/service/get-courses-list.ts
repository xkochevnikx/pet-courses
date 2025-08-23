import { injectable } from "inversify";

import {
  CoursesRepository,
  GetCoursesListService,
} from "@/shared/types/abstract-classes";
import { CourseEntity } from "@/shared/types/domain-types";

@injectable()
export class GetCoursesListServiceImp extends GetCoursesListService {
  constructor(private coursesRepository: CoursesRepository) {
    super();
  }
  async exec(): Promise<CourseEntity[]> {
    return await this.coursesRepository.getCoursesList();
  }
}
