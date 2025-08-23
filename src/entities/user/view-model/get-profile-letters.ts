import { Profile } from "@/shared/types/domain-types";

import { getProfileUserName } from "./get-profile-user-name";

export const getProfileLetters = (profile: Profile) => {
  const displayName = getProfileUserName(profile);
  const [a, b] = displayName.split("@")[0].split(/\.|\s|-|_/);

  if (!b) {
    return `${a[0]?.toUpperCase() ?? ""}${a[1]?.toUpperCase() ?? ""}`;
  }

  return `${a[0]?.toUpperCase() ?? ""}${b[0]?.toUpperCase() ?? ""}`;
};
