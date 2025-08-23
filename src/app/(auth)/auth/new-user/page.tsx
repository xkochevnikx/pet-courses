// import { server } from "@/app/init";
// import { SessionServer } from "@/entities/user/server-index";
import { UpdateProfileForm } from "@/features/update-profile";
import { Separator } from "@/shared/ui/separator";

// const getServerSession = server.get(SessionServer);

export default async function NewUserPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl: string }>;
}) {
  const params = (await searchParams)?.callbackUrl;
  // const session = await getServerSession.get();

  // if (!session) {
  //   return redirect("/auth/sign-in");
  // }
  return (
    <main className="space-y-6 py-14 container  max-w-[600px]">
      <div>
        <h3 className="text-lg font-medium">Последний шаг</h3>
        <p className="text-sm text-muted-foreground">
          Обновите профиль, это как другие пользователи увидят вас на сайте
        </p>
      </div>
      <Separator />
      <UpdateProfileForm userId={"1"} callbackUrl={params} />
    </main>
  );
}
