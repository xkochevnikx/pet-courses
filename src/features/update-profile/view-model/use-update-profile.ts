import { useAppSessionClient } from "@/entities/user";

import { updateProfileApi } from "../api";

export const useUpdateProfile = () => {
  const { update: updateSession } = useAppSessionClient();

  const utils = updateProfileApi.useUtils();

  const { mutateAsync, isPending } =
    updateProfileApi.updateProfile.update.useMutation({
      async onSuccess(profile, { userId }) {
        await utils.updateProfile.get.invalidate({ userId });
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
