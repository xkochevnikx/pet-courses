"use client";

import { useRouter } from "next/navigation";

import { Spinner } from "@/shared/ui/spinner";

import { updateProfileApi } from "../api";

import { UpdateForm } from "./update-form";

export const UpdateProfileForm = ({
  userId,
  callbackUrl,
}: {
  userId: string;
  callbackUrl?: string;
}) => {
  const router = useRouter();

  const profile = updateProfileApi.updateProfile.get.useQuery({ userId });

  const handleSuccess = () => {
    if (callbackUrl) {
      router.push(callbackUrl);
    }
  };

  if (profile.isPending) {
    return (
      <div className="inset-0 flex items-center justify-center absolute">
        <Spinner aria-label="загрузка профиля" className="w-10 h-10" />
      </div>
    );
  }

  if (!profile.data) {
    return <div>Не удалось загрузить профиль возможно у вас нет прав</div>;
  }

  return (
    <UpdateForm
      profile={profile.data}
      onSuccess={handleSuccess}
      userId={userId}
      submitText={callbackUrl ? "Продожить" : "Сохранить"}
    />
  );
};
