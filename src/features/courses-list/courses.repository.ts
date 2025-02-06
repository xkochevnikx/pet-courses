import { cache } from "react";

import { dbClient } from "@/shared/lib/db";

import {
  CourseListElement,
  CreateCourseListElementCommand,
  DeleteCourseListElementCommand,
} from "./model/types";

class CoursesRepository {
  getCoursesList = cache((): Promise<CourseListElement[]> => {
    return dbClient.course.findMany();
  });

  createCorseElement = (
    command: CreateCourseListElementCommand,
  ): Promise<CourseListElement> => {
    return dbClient.course.create({ data: command });
  };

  deleteCourseElement = (command: DeleteCourseListElementCommand) => {
    return dbClient.course.delete({ where: { id: command.id } });
  };
}

export const coursesRepository = new CoursesRepository();
