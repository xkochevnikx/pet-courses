import { CoursesListServer } from "@/features/courses-list/server-index";

export default async function Home() {
  return (
    <>
      <h1 className="text-orange-700">Deploy test!</h1>

      <CoursesListServer className="max-w-[600px] mb-10 p-4" />
    </>
  );
}
