import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
} from "next-auth/react";
import { ReactNode } from "react";

export function SessionProvider({ children }: { children?: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

export const useAppSession = useSession;
