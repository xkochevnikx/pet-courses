import { coursesRepository } from "../courses.repository";
import { revalidatePath } from "next/cache";
import { CourseItem } from "../ui/course-item";
import { cn } from "@/shared/lib/utils";
export const CoursesList = async ({
  revalidatePagePath,
  className,
}: {
  revalidatePagePath: string;
  className: string;
}) => {
  const courses = await coursesRepository.getCoursesList();

  const handleDeleteAction = async (courseId: string) => {
    "use server";
    await coursesRepository.deleteCourseElement({ id: courseId });
    revalidatePath(revalidatePagePath);
  };

  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      {courses.map((course) => (
        <CourseItem
          key={course.id}
          course={course}
          onDelete={handleDeleteAction.bind(null, course.id)}
          //   onDelete={() => handleDeleteAction(course.id)}
        />
      ))}
    </div>
  );
};
