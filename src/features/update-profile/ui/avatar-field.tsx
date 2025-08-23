import { ProfileAvatar, useAppSessionClient } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

import { useUploadAvatar } from "../view-model/use-upload-avatar";

export const AvatarField = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) => {
  const session = useAppSessionClient();
  const { handleFileSelect, isPending } = useUploadAvatar({
    onSuccess: onChange,
  });
  return (
    <Button
      variant="ghost"
      type="button"
      onClick={() => handleFileSelect(session?.data?.user.id ?? "")}
      className="w-[64px] h-[64px] p-0.5 rounded-full relative block"
    >
      {isPending && (
        <div className="inset-0 absolute flex items-center justify-center z-10">
          <Spinner />
        </div>
      )}
      <ProfileAvatar
        className="h-full w-full"
        profile={{ email: session?.data?.user.email ?? "", image: value }}
      />
    </Button>
  );
};
