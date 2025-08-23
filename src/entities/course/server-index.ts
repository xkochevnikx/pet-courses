import { ContainerModule } from "inversify";

import {
  CoursesRepository,
  GetCoursesListService,
} from "@/shared/types/abstract-classes";

import { CoursesRepositoryImp } from "./repository/courses.repository";
import { GetCoursesListServiceImp } from "./service/get-courses-list";

export const CourseEntityModule = new ContainerModule((bind) => {
  bind(GetCoursesListService).to(GetCoursesListServiceImp);
  bind(CoursesRepository).to(CoursesRepositoryImp);
});
