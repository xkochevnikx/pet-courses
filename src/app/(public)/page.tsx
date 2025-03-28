import {
  CoursesList,
  coursesRepository,
  CreateCourseForm,
} from "@/features/courses-list";

export default async function Home() {
  const courses = await coursesRepository.getCoursesList();

  return (
    <>
      <h1 className="text-orange-700">Deploy test!</h1>
      <CreateCourseForm
        revalidatePagePath="/"
        className="max-w-[300px] mb-10 p-4 "
      />
      <CoursesList
        revalidatePagePath="/"
        className="max-w-[300px] mb-10 p-4"
        courses={courses}
      />
    </>
  );
}
