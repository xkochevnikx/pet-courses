export { SessionProvider } from "../../kernel/lib/next-auth/session-provider";
export { useAppSessionClient } from "./model/get-session-client";
export { useRole } from "./model/use-role";
export { ProfileAvatar } from "./ui/profile-avatar";

export {
  getProfileQuery,
  useInvalidateProfile,
} from "./queries/getProfileQuery";

export { type Profile } from "@/entities/user/domain/types";
