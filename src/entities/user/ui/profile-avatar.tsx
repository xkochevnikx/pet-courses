import { cn } from "@/shared/lib/utils";
import { Profile } from "@/shared/types/domain-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { getProfileLetters } from "../view-model/get-profile-letters";

export const ProfileAvatar = ({
  profile,
  className,
}: {
  profile?: Profile;
  className?: string;
}) => {
  if (!profile) {
    return null;
  }

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={profile.image ?? ""} className="object-cover" />
      <AvatarFallback>{getProfileLetters(profile)}</AvatarFallback>
    </Avatar>
  );
};
