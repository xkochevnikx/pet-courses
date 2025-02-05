import { CoursesList } from "@/features/courses-list/pub/courses-list";
import { CreateCourseForm } from "@/features/courses-list/pub/create-course-form";

export default async function Home() {
  return (
    <>
      <h1 className="text-orange-700">Deploy test 2</h1>
      <CreateCourseForm
        revalidatePagePath="/"
        className="max-w-[300px] mb-10 p-4"
      />
      <CoursesList revalidatePagePath="/" className="max-w-[300px] mb-10 p-4" />
    </>
  );
}
