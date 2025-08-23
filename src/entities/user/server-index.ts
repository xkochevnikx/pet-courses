import { ContainerModule } from "inversify";

import {
  CreateUserService,
  GetProfileService,
  NextAuthConfig,
  ProfileRepository,
  SessionServer,
  UpdateProfileService,
  UserRepository,
} from "@/shared/types/abstract-classes";

import { SessionServerImp } from "./model/get-session-server";
import { NextAuthConfigImp } from "./model/next-auth-config";
import { ProfileRepositoryImp } from "./repository/profile";
import { UserRepositoryImp } from "./repository/user";
import { CreateUserServiceImp } from "./services/create-user";
import { GetProfileServiceImp } from "./services/get-profile";
import { UpdateProfileServiceImp } from "./services/update-profile";
export { avatarPathResultSchema } from "./domain/schema";

export { profileSchema } from "./domain/schema";

export { createProfileAbility, createUserAbility } from "./domain/ability";

export const UserEntityModule = new ContainerModule((bind) => {
  bind(ProfileRepository).to(ProfileRepositoryImp);
  bind(UserRepository).to(UserRepositoryImp);
  bind(CreateUserService).to(CreateUserServiceImp);
  bind(GetProfileService).to(GetProfileServiceImp);
  bind(UpdateProfileService).to(UpdateProfileServiceImp);
  bind(SessionServer).to(SessionServerImp);
  bind(NextAuthConfig).to(NextAuthConfigImp);
});
