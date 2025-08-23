import "next-auth";
import { SessionEntity, UserEntity } from "./domain-types";

declare module "next-auth" {
  interface Session {
    user: SessionEntity["user"];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends UserEntity {}
}
