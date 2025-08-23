import { selectFile } from "@/shared/lib/file";
import { UserId } from "@/shared/types/domain-types";

import { updateProfileApi } from "../api";
import { serializeFileToBase64 } from "../model/lib/helpers";

export const useUploadAvatar = ({
  onSuccess,
}: {
  onSuccess: (value: string) => void;
  onError?: (desc: string) => void;
}) => {
  const { mutateAsync, isPending } =
    updateProfileApi.updateProfile.uploadAvatar.useMutation({
      onSuccess(data) {
        onSuccess(data.path);
      },
    });

  const handleFileSelect = async (userId: UserId) => {
    const file = await selectFile("image/*");
    if (!file) return;

    const serializeFile = await serializeFileToBase64(file);

    await mutateAsync({
      userId,
      avatar: serializeFile,
    });
  };

  return {
    isPending,
    handleFileSelect,
  };
};
