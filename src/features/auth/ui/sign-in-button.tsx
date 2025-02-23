"use client";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/shared/ui/button";

export const SignInButton = () => {
  const handleSignIn = () => signIn();
  return (
    <Button variant={"outline"} onClick={handleSignIn}>
      <LogIn className="mr-2 h-4 w-4" /> войти
    </Button>
  );
};
