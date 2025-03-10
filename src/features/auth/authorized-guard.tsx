"use client";

import { signIn } from "next-auth/react";
import React, { useEffect } from "react";

import { useAppSessionClient } from "@/entities/user";
import { FullPageSpinner } from "@/shared/ui/full-page-spinner";

export const AuthorizedGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = useAppSessionClient();
  const isUnauthenticated = session.status === "unauthenticated";
  const isAuthenticated = session.status === "authenticated";
  const isLoading =
    session.status === "loading" || session.status === "unauthenticated";

  useEffect(() => {
    if (isUnauthenticated) {
      signIn();
    }
  }, [isUnauthenticated]);

  return (
    <>
      <FullPageSpinner isLoading={isLoading} />
      {isAuthenticated && children}
    </>
  );
};
