"use client";
import { ClientSafeProvider } from "next-auth/react";

import { Button } from "@/shared/ui/button";

export const ProviderButton = ({
  provider,
}: {
  provider: ClientSafeProvider;
}) => {
  return <Button>{provider.name}</Button>;
};
