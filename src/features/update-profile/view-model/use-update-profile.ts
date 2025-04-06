import { useMutation } from "@tanstack/react-query";

import { useAppSessionClient, useInvalidateProfile } from "@/entities/user";

import { updateProfileAction } from "../actions/updateProfileAction";

export const useUpdateProfile = () => {
  const { update: updateSession } = useAppSessionClient();
  const invalidateProfile = useInvalidateProfile();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateProfileAction,
    async onSuccess({ profile }, { userId }) {
      await invalidateProfile(userId);
      await updateSession({
        user: profile,
      });
    },
  });

  return {
    update: mutateAsync,
    isLoading: isPending,
  };
};
