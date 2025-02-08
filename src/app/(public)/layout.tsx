import { ReactNode } from "react";

import { Header } from "@/widgets/header";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Header variant="public" />
      {children}
    </>
  );
}
