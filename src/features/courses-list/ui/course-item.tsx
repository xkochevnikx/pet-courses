"use client";

import { CourseEntity } from "@/shared/types/domain-types";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export const CourseItem = ({ course }: { course: CourseEntity }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};
