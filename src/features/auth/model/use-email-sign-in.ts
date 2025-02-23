import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
// eslint-disable-next-line import/order
import { useSearchParams } from "next/navigation";

export const useEmailSignIn = () => {
  const callbackUrl = useSearchParams().get("callbackUrl");
  const emailSignInMutation = useMutation({
    mutationFn: (email: string) =>
      signIn("email", { email, callbackUrl: callbackUrl ?? undefined }),
  });

  return {
    signIn: emailSignInMutation.mutate,
    signInIsLoading: emailSignInMutation.isPending,
  };
};
