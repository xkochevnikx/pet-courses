import { useAppSessionClient } from "@/entities/user";
import { useToast } from "@/shared/ui/toast/toasts-context";

import { updateProfileApi } from "../api";

export const useUpdateProfile = () => {
  const { update: updateSession } = useAppSessionClient();
  const { addToasts } = useToast();
  const utils = updateProfileApi.useUtils();

  const { mutateAsync, isPending } =
    updateProfileApi.updateProfile.update.useMutation({
      async onSuccess(profile, { userId }) {
        addToasts({
          type: "success",
          message: "Profile updated successfully",
        });
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
