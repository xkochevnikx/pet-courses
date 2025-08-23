import { Profile } from "@/shared/types/domain-types";

export const getProfileUserName = (profile: Profile) => {
  return profile.name ? profile.name : profile.email;
};
