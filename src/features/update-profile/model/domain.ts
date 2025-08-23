import { Profile } from "@/shared/types/domain-types";

export const getDefaultValues = (profile: Profile) => ({
  email: profile?.email,
  image: profile?.image ?? undefined,
  name: profile?.name ?? "",
});
