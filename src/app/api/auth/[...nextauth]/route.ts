import NextAuth from "next-auth/next";

import { nextAuthConfig } from "@/entities/user/server-index";

const authHandler = NextAuth(nextAuthConfig);

export { authHandler as GET, authHandler as POST };
