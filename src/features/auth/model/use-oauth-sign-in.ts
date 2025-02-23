import { useMutation } from "@tanstack/react-query";
import { ClientSafeProvider, signIn } from "next-auth/react";
// eslint-disable-next-line import/order
import { useSearchParams } from "next/navigation";

export const useOauthSignIn = (provider: ClientSafeProvider) => {
  const callbackUrl = useSearchParams().get("callbackUrl");
  const oauthSignInMutation = useMutation({
    mutationFn: () =>
      signIn(provider.id, {
        callbackUrl:
          callbackUrl ??
          `${window.location.origin}/api/auth/callback/${provider.id}`,
      }),
  });

  return {
    oauthSignIn: oauthSignInMutation.mutate,
    oauthSignInIsLoading: oauthSignInMutation.isPending,
  };
};
