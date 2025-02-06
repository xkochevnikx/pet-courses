"use client";

import { cn } from "@/shared/lib/utils";
import ErrorBoundary from "@/shared/ui/errorBoundary";

import { handleDeleteAction } from "../model/actions";
import { CourseListElement } from "../model/types";
import { CourseItem } from "../ui/course-item";
import { CourseItemFallback } from "../ui/course-item.fallback";

export const CoursesList = ({
  revalidatePagePath,
  className,
  courses,
}: {
  revalidatePagePath: string;
  className: string;
  courses: CourseListElement[];
}) => {
  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      {courses.map((course) => (
        <ErrorBoundary key={course.id} fallback={CourseItemFallback}>
          <CourseItem
            course={course}
            onDelete={() =>
              handleDeleteAction({
                revalidatePagePath,
                courseId: course.id,
              })
            }
          />
        </ErrorBoundary>
      ))}
    </div>
  );
};
