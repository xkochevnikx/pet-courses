import React from "react";

import { getCoursesListService } from "@/entities/course/server-index";
import { cn } from "@/shared/lib/utils";

import { CourseItem } from "./course-item";

export const CoursesList = async ({ className }: { className: string }) => {
  const courses = await getCoursesListService.exec();
  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      {courses?.map((course, index) => (
        <React.Fragment key={index}>
          <CourseItem course={course} />
        </React.Fragment>
      ))}
    </div>
  );
};
