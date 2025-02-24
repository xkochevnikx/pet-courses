import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";

import { dbClient } from "@/shared/lib/db";
import { privateEnv } from "@/shared/lib/parse-private-env";

export const nextAuthConfig: AuthOptions = {
  adapter: PrismaAdapter(dbClient) as AuthOptions["adapter"],
  pages: {
    signIn: "/auth/sign-in",
    newUser: "/auth/new-user",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    EmailProvider({
      server: {
        host: privateEnv.EMAIL_SERVER_HOST,
        port: Number(privateEnv.EMAIL_SERVER_PORT),
        auth: {
          user: privateEnv.EMAIL_SERVER_USER,
          pass: privateEnv.EMAIL_SERVER_PASSWORD,
        },
        secure: false,
      },
      from: privateEnv.EMAIL_FROM,
    }),
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
