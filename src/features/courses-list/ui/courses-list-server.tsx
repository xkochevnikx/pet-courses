"use server";
import { cn } from "@/shared/lib/utils";

import { coursesListApiServer } from "../api";

import { CoursesList } from "./courses-list";

export const CoursesListServer = async ({
  className,
}: {
  className?: string;
}) => {
  const coursesList = await coursesListApiServer.coursesList.get.query();
  return (
    <div className={cn(className)}>
      <CoursesList initialData={coursesList} />
    </div>
  );
};
