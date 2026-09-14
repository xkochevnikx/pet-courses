import { ReactNode } from "react";

import { Header } from "@/widgets/header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
