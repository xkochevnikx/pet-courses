"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { ReactNode } from "react";

import { SessionProvider } from "@/entities/user";
import { ThemeProvider } from "@/features/theme-switcher";
import { queryClient } from "@/shared/api/query-client";

import { TrpcProvider } from "./trpc-provider";

export const AppProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) => {
  return (
    <TrpcProvider client={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </TrpcProvider>
  );
};
