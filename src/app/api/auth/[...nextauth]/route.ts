import NextAuth from "next-auth";

import { initialInversify } from "@/app/initInversifyContainer";
import { NextAuthConfig } from "@/shared/types/abstract-classes";

const authHandler = NextAuth(initialInversify.get(NextAuthConfig).options);

export { authHandler as GET, authHandler as POST };
