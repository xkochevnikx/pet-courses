"use server";
import { getServerSession } from "next-auth";

import { nextAuthConfig } from "./next-auth-config";

export const useAppSessionServer = async () =>
  await getServerSession(nextAuthConfig);
