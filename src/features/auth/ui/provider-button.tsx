"use client";
import { Github } from "lucide-react";
import { ClientSafeProvider } from "next-auth/react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

import { useOauthSignIn } from "../model/use-oauth-sign-in";

export const ProviderButton = ({
  provider,
  className,
}: {
  provider: ClientSafeProvider;
  className?: string;
}) => {
  const oauthSignIn = useOauthSignIn(provider);

  const getIconProvider = (id: string) => {
    switch (id) {
      case "github":
        return <Github className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Button
      className={cn(className, "min-w-full")}
      variant="outline"
      type="button"
      disabled={oauthSignIn.oauthSignInIsLoading}
      onClick={() => oauthSignIn.oauthSignIn()}
    >
      {oauthSignIn.oauthSignInIsLoading ? (
        <Spinner className="mr-2 h-4 w-4 " aria-label="Загрузка выхода" />
      ) : (
        getIconProvider(provider.id)
      )}
      {provider.name}
    </Button>
  );
};
