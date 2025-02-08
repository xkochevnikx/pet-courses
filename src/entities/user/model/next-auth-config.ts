import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { dbClient } from "@/shared/lib/db";
import { privateEnv } from "@/shared/lib/parse-private-env";

export const nextAuthConfig: AuthOptions = {
  adapter: PrismaAdapter(dbClient) as AuthOptions["adapter"],
  providers: [
    ...(privateEnv.GITHUB_ID && privateEnv.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: privateEnv.GITHUB_ID,
            clientSecret: privateEnv.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
};
