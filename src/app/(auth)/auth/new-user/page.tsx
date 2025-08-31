import { redirect } from "next/navigation";

import { initialInversify } from "@/app/initInversifyContainer";
import { UpdateProfileForm } from "@/features/update-profile";
import { SessionServer } from "@/shared/types/abstract-classes";
import { Separator } from "@/shared/ui/separator";

const getSession = initialInversify.get(SessionServer);

export default async function NewUserPage() {
  const session = await getSession.get();
  if (!session) {
    return redirect("/auth/sign-in");
  }
  return (
    <main className="space-y-6 py-14 container  max-w-[600px]">
      <div>
        <h3 className="text-lg font-medium">Последний шаг</h3>
        <p className="text-sm text-muted-foreground">
          Обновите профиль, это как другие пользователи увидят вас на сайте
        </p>
      </div>
      <Separator />
      <UpdateProfileForm userId={session?.user.id ?? ""} />
    </main>
  );
}
