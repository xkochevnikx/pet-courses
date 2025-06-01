import { join } from "path";

import { loggedMethod } from "@/shared/lib/logger/logged-method";

import { Course } from "../schemas/course.schema";
import courseSchema from "../schemas/course.schema.json";
import { Lesson } from "../schemas/lesson.schema";
import lessonSchema from "../schemas/lesson.schema.json";
import { Manifest } from "../schemas/manifest.schema";
import manifestSchema from "../schemas/manifest.schema.json";

import { CourseSlug, Deps, LessonSlug } from "./types";

export class ContentApi {
  private url: string;
  private deps: Deps;
  constructor(url: string, deps: Deps) {
    this.url = url;
    this.deps = deps;
  }

  //! url generate ---------
  private getManifestUrl() {
    return join(this.url, "manifest.yaml");
  }
  private getCourseUrl(slug: CourseSlug) {
    return join(this.url, `courses/${slug}/course.yaml`);
  }
  private getLessonUrl(slug: CourseSlug, lesson: LessonSlug) {
    return join(this.url, `course/${slug}/lessons/${lesson}/lesson.yaml`);
  }
  //!------------------------

  //! fetchManifest
  async fetchManifest() {
    return this.deps.cacheStrategy.fetch(["manifest"], () =>
      this.fetchManifestQuery(),
    );
  }
  @loggedMethod({ logRes: (res: Manifest) => res })
  private async fetchManifestQuery() {
    const text = await this.deps.fileFetcher.fetchText(this.getManifestUrl());
    return this.deps.contentParser.parse<Manifest>(text, manifestSchema);
  }

  //! fetchCourse
  async fetchCourse(slug: CourseSlug) {
    return this.deps.cacheStrategy.fetch(["course", slug], () =>
      this.fetchCourseQuery(slug),
    );
  }
  private async fetchCourseQuery(slug: CourseSlug) {
    const text = await this.deps.fileFetcher.fetchText(this.getCourseUrl(slug));
    return this.deps.contentParser.parse<Course>(text, courseSchema);
  }

  //! fetchLesson
  async fetchLesson(courseSlug: CourseSlug, lessonSlug: LessonSlug) {
    return this.deps.cacheStrategy.fetch(
      ["lesson", courseSlug, lessonSlug],
      () => this.fetchLessonQuery(courseSlug, lessonSlug),
    );
  }
  private async fetchLessonQuery(
    courseSlug: CourseSlug,
    lessonSlug: LessonSlug,
  ) {
    const text = await this.deps.fileFetcher.fetchText(
      this.getLessonUrl(courseSlug, lessonSlug),
    );
    return this.deps.contentParser.parse<Lesson>(text, lessonSchema);
  }
}
