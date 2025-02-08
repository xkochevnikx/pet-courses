import { ReactNode } from "react";

import { Header } from "@/widgets/header";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header variant="auth" />
      {children}
    </>
  );
}
