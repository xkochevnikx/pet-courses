"use server";

import { getProviders } from "next-auth/react";
import { Suspense } from "react";

import { cn } from "@/shared/lib/utils";

import { Divider } from "./divider";
import { EmailSignInForm } from "./email-sign-in-form";

export const SignInForm = async ({ className }: { className?: string }) => {
  const oauthProviders = await getProviders().then((providers) => {
    return Object.values(providers ?? {}).filter(
      (provider) => provider.type === "oauth",
    );
  });
  console.log("🚀 ~ oauthProviders ~  oauthProviders:", oauthProviders);
  return (
    <div className={cn(className, "flex-col gap-6")}>
      <Suspense fallback={<div>Загрузка...</div>}>
        <EmailSignInForm />
      </Suspense>
      <Divider />
      {/* {oauthProviders?.map(() => (
        <></>
        // <ProviderButton key={provider.id} provider={provider} />
      ))} */}
    </div>
  );
};
