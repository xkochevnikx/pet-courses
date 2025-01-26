import { client } from "@/shared/lib/db";
import { Button } from "@/shared/ui/button";

export default async function Home() {
  const courses = await client.course.findMany();
  console.log("🚀 ~ Home ~ courses:", courses);
  return (
    <>
      <Button variant="secondary">Button</Button>
    </>
  );
}
