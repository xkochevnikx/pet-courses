import { Roboto_Mono, Smooch_Sans } from "next/font/google";
import { ReactNode } from "react";

import { useAppSessionServer } from "@/entities/user/server-index";
import { cn } from "@/shared/lib/utils";

import { AppProvider } from "./providers/app-provider";

import type { Metadata } from "next";

import "./globals.css";

//дефолтный шрифт
const roboto = Roboto_Mono({ subsets: ["latin"] });
//для эксперимента второй шрифт через определение переменной окружения
const testFonts = Smooch_Sans({
  variable: "--test-fonts",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAppSessionServer();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(roboto.className, testFonts.variable, "antialiased")}>
        <AppProvider session={session}>{children}</AppProvider>
      </body>
    </html>
  );
}
