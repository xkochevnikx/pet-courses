"use client";
import { AvatarImage } from "@radix-ui/react-avatar";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

import { useAppSessionClient } from "@/entities/user";
import { SignInButton, useSignOut } from "@/features/auth";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";

export function Profile() {
  const session = useAppSessionClient();
  console.log("🚀 ~ Profile ~ session:", session);

  const { signOut, isLoading } = useSignOut();

  if (session.status === "loading") {
    return <Skeleton className="rounded-full h-8 w-8" />;
  }

  if (session.status === "unauthenticated") {
    return <SignInButton />;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-px rounded-full self-center h-8 w-8"
        >
          <Avatar>
            <AvatarImage src={session?.data?.user.image ?? ""} />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2 ">
        <DropdownMenuLabel>
          <p>Мой аккаунт</p>
          <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
            {session.data?.user?.name ?? ""}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile/${1}`}>
              <User className="mr-2 h-4 w-4" />
              <span>Профиль</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Выход</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
