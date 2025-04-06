import { useMutation } from "@tanstack/react-query";

import { selectFile, validateFileSize } from "@/shared/lib/file";

import { uploadAvatarAction } from "../actions/upload-avatar-action";
import { AVATAR_FILE_KEY, AVATAR_MAX_SIZE } from "../constants";

export const useUploadAvatar = ({
  // onSuccess,
  onError,
}: {
  onSuccess: (value: string) => void;
  onError: (desc: string) => void;
}) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: uploadAvatarAction,
    onSuccess() {
      // onSuccess?.();
    },
  });

  const handleFileSelect = async () => {
    const file = await selectFile("image/*");
    if (!file) return;
    if (!validateFileSize(file, AVATAR_MAX_SIZE)) {
      return onError?.("big-size");
    }

    const formData = new FormData();

    formData.set(AVATAR_FILE_KEY, file);

    await mutateAsync(formData);
  };

  return {
    isPending,
    handleFileSelect,
  };
};
