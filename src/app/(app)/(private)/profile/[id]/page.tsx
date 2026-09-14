import { UpdateProfileForm } from "@/features/update-profile";
import { Separator } from "@/shared/ui/separator";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return (
    <main className="space-y-6 py-14 container max-w-[600px]">
      <h3 className="text-lg font-medium">Профиль</h3>
      <p className="text-sm text-muted-foreground">Как вас видят другие</p>
      <Separator />
      <UpdateProfileForm userId={id} />
    </main>
  );
}
