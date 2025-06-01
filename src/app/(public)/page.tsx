import { CoursesList } from "@/features/courses-list";

export default async function Home() {
  return (
    <>
      <h1 className="text-orange-700">Deploy test!</h1>

      <CoursesList className="max-w-[300px] mb-10 p-4" />
    </>
  );
}
