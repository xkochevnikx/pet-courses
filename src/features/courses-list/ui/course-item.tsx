"use client";

import { CourseEntity } from "@/shared/types/domain-types";
import { Card, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";

export const CourseItem = ({ course }: { course: CourseEntity }) => {
  // const ComponentDescription = useMdxComponent(course.description);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        {/* <ComponentDescription size="sm" /> */}
      </CardHeader>
      <CardFooter className="flex gap-1"></CardFooter>
    </Card>
  );
};
