import { ReactNode } from "react";

import { Header } from "@/widgets/header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header variant="auth" />
      {children}
    </>
  );
}
