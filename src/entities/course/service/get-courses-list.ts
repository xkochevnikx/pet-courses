import { CourseEntity } from "../domain/types";
import { coursesRepository } from "../repository/courses.repository";

export class GetCoursesListService {
  async exec(): Promise<CourseEntity[]> {
    return await coursesRepository.getCoursesList();
  }
}

export const getCoursesListService = new GetCoursesListService();
