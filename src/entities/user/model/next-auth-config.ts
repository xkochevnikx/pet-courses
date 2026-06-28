import { PrismaAdapter } from "@auth/prisma-adapter";
import { injectable } from "inversify";
import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";

import { dbClient } from "@/shared/lib/db";
import { privateEnv } from "@/shared/lib/env/parse-private-env";
import {
  CreateUserService,
  NextAuthConfig,
} from "@/shared/types/abstract-classes";
import { CreateUser, ROLES, UserEntity } from "@/shared/types/domain-types";

import type { OAuthConfig } from "next-auth/providers/oauth";

const prismaAdapter = PrismaAdapter(dbClient);

type BotProfile = {
  id: string;
  username?: string;
  email: string;
};

@injectable()
export class NextAuthConfigImp extends NextAuthConfig {
  constructor(private createUser: CreateUserService) {
    super();
  }

  options: AuthOptions = {
    adapter: {
      ...prismaAdapter,
      createUser: async (user: CreateUser): Promise<UserEntity> => {
        return this.createUser.exec(user);
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
      ...(privateEnv.BOT_CLIENT_ID &&
      privateEnv.BOT_CLIENT_SECRET &&
      privateEnv.AUTHORIZATION_BOT_URL
        ? [
            {
              id: "TelegramBot",
              name: "Telegram Bot",
              type: "oauth",
              checks: ["pkce", "state"],
              authorization: {
                url: `${privateEnv.AUTHORIZATION_BOT_URL}/oauth/authorize`,
                params: {
                  scope: "all ", // если нужно больше, чем openid
                },
              },
              token: `${privateEnv.AUTHORIZATION_BOT_URL}/oauth/access_token`,
              userinfo: `${privateEnv.AUTHORIZATION_BOT_URL}/oauth/user`,
              clientId: privateEnv.BOT_CLIENT_ID,
              clientSecret: privateEnv.BOT_CLIENT_SECRET,
              profile(profile: BotProfile) {
                return {
                  id: profile.id,
                  name: profile.username ?? null,
                  email: profile.email ?? `${profile.id}@telegram.local`,
                  role: ROLES.USER,
                };
              },
            } satisfies OAuthConfig<BotProfile>,
          ]
        : []),
    ],
  };
}
