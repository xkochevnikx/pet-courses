import { injectable } from "inversify";

import { contentApi } from "@/shared/api/content";
import { CourseSlug } from "@/shared/api/content/lib/types";
import { CompileMdx } from "@/shared/lib/compileMDX";
import { logger } from "@/shared/lib/logger/pino-config";
import { CoursesRepository } from "@/shared/types/abstract-classes";
import { CourseEntity } from "@/shared/types/domain-types";

@injectable()
export class CoursesRepositoryImp extends CoursesRepository {
  getCoursesList = async (): Promise<CourseEntity[]> => {
    const manifest = await contentApi.fetchManifest();

    const fetchCourse = async (slug: CourseSlug): Promise<CourseEntity> => {
      const course = await contentApi.fetchCourse(slug);

      return {
        id: course.id,
        title: course.title,
        description: await CompileMdx(course.description).then(
          (result) => result.code,
        ),
        slug,
      };
    };

    const settledCourses = await Promise.allSettled(
      manifest.courses.map(fetchCourse),
    );

    settledCourses.forEach((value, i) => {
      if (value.status === "rejected") {
        logger.error({
          msg: "Course by slug not found",
          slug: manifest.courses[i],
          error: value.reason,
        });
      }
    });

    return settledCourses
      .filter(
        (
          courseResult,
        ): courseResult is PromiseFulfilledResult<CourseEntity> => {
          return courseResult.status === "fulfilled";
        },
      )
      .map((course) => {
        return course.value;
      });
  };
}
