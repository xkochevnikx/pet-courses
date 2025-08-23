"use client";

import React from "react";

import { cn } from "@/shared/lib/utils";
import { CourseEntity } from "@/shared/types/domain-types";

import { coursesListApi } from "../api";

import { CourseItem } from "./course-item";

export const CoursesList = ({
  className,
  initialData,
}: {
  className?: string;
  initialData: CourseEntity[];
}) => {
  const { data: courses } = coursesListApi.coursesList.get.useQuery(undefined, {
    initialData,
  });
  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      {courses.map((course, index) => (
        <React.Fragment key={index}>
          <CourseItem course={course} />
        </React.Fragment>
      ))}
    </div>
  );
};
