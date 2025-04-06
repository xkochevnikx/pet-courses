import { Profile } from "@/entities/user";

export const getDefaultValues = (profile: Profile) => ({
  email: profile?.email,
  image: profile?.image ?? undefined,
  name: profile?.name ?? "",
});
