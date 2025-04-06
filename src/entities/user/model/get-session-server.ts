import { getServerSession } from "next-auth";

import { NeedAuthError } from "@/shared/lib/errors";

import { nextAuthConfig } from "./next-auth-config";

export const getAppSessionServer = async () =>
  await getServerSession(nextAuthConfig);

export const getAppSessionStrictServer = async () => {
  const session = getAppSessionServer();
  if (session === null) {
    throw new NeedAuthError();
  }

  return session;
};
