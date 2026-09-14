import { injectable } from "inversify";

import { CoursesRepository } from "@/shared/types/abstract-classes";
import { CourseEntity } from "@/shared/types/domain-types";

@injectable()
export class CoursesRepositoryImp extends CoursesRepository {
  getCoursesList = async (): Promise<CourseEntity[]> => {
    return [];
    // const manifest = await contentApi.fetchManifest();
    // const fetchCourse = async (slug: CourseSlug): Promise<CourseEntity> => {
    //   const course = await contentApi.fetchCourse(slug);
    //   return {
    //     id: course.id,
    //     title: course.title,
    //     slug,
    //   };
    // };
    // const settledCourses = await Promise.allSettled(
    //   manifest.courses.map(fetchCourse),
    // );
    // settledCourses.forEach((value, i) => {
    //   if (value.status === "rejected") {
    //     logger.error({
    //       msg: "Course by slug not found",
    //       slug: manifest.courses[i],
    //       error: value.reason,
    //     });
    //   }
    // });
    // console.log(settledCourses);
    // return settledCourses
    //   .filter(
    //     (
    //       courseResult,
    //     ): courseResult is PromiseFulfilledResult<CourseEntity> => {
    //       return courseResult.status === "fulfilled";
    //     },
    //   )
    //   .map((course) => {
    //     return course.value;
    //   });
  };
}
