import { SessionEntity, UserEntity } from "@/kernel/domain/types";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: SessionEntity["user"];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends UserEntity {}
}
