import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";

import { CreateUser } from "@/entities/user/services/create-user";
import { ROLES, UserEntity } from "@/kernel/domain/types";
import { dbClient } from "@/shared/lib/db";
import { privateEnv } from "@/shared/lib/env/parse-private-env";
import { createAppId } from "@/shared/lib/ids";

const prismaAdapter = PrismaAdapter(dbClient);

export const nextAuthConfig: AuthOptions = {
  adapter: {
    ...prismaAdapter,
    createUser: async (user: CreateUser) => {
      const adminEmails = privateEnv.ADMIN_EMAILS?.split(",") ?? [];
      const role = adminEmails.includes(user?.email) ? ROLES.ADMIN : ROLES.USER;

      const userCreated: UserEntity = {
        ...user,
        role: role as "ADMIN" | "USER",
        id: createAppId(),
      };

      return await dbClient.user.create({ data: userCreated });
    },
  } as AuthOptions["adapter"],
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.debug("NextAuth Debug:", code, metadata);
    },
  },
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
      };
    },
  },
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
