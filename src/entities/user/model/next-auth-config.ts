import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";

import { dbClient } from "@/shared/lib/db";
import { privateEnv } from "@/shared/lib/parse-private-env";

import { CreateUser, createUserUseCases } from "../use-cases/create-user";

const prismaAdapter = PrismaAdapter(dbClient);

export const nextAuthConfig: AuthOptions = {
  adapter: {
    ...prismaAdapter,
    createUser: (user: CreateUser) => {
      return createUserUseCases.exec(user);
    },
  } as AuthOptions["adapter"],
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
