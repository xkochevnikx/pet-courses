import { ReactNode } from "react";

import { AuthorizedGuard } from "@/features/auth";
import { Header } from "@/widgets/header";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Header variant="private" />
      <AuthorizedGuard> {children}</AuthorizedGuard>
    </>
  );
}
