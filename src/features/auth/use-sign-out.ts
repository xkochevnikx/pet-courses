import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

export const useSignOut = () => {
  const mutation = useMutation({
    mutationFn: () => signOut({ callbackUrl: "/" }),
  });
  return {
    signOut: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
