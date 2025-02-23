"use server";

import { getProviders } from "next-auth/react";
import { Suspense } from "react";

import { cn } from "@/shared/lib/utils";

import { Divider } from "./divider";
import { EmailSignInForm } from "./email-sign-in-form";
import { ProviderButton } from "./provider-button";

export const SignInForm = async ({ className }: { className?: string }) => {
  const oauthProviders = await getProviders().then((providers) => {
    return Object.values(providers ?? {}).filter(
      (provider) => provider.type === "oauth",
    );
  });
  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      <Suspense fallback={<div>Загрузка...</div>}>
        <EmailSignInForm className="flex flex-col gap-6" />
      </Suspense>
      <Divider />
      <Suspense fallback={<div>Загрузка...</div>}>
        {oauthProviders?.map((provider) => (
          <ProviderButton
            key={provider.id}
            provider={provider}
            className="min-w-fit"
          />
        ))}
      </Suspense>
    </div>
  );
};
