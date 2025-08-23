import { injectable } from "inversify";

import { privateEnv } from "@/shared/lib/env/parse-private-env";
import { createAppId } from "@/shared/lib/ids";
import {
  CreateUserService,
  UserRepository,
} from "@/shared/types/abstract-classes";
import { CreateUser, ROLES, UserEntity } from "@/shared/types/domain-types";

@injectable()
export class CreateUserServiceImp extends CreateUserService {
  constructor(private userRepository: UserRepository) {
    super();
  }
  async exec(data: CreateUser): Promise<UserEntity> {
    const adminEmails = privateEnv.ADMIN_EMAILS?.split(",") ?? [];
    const role = adminEmails.includes(data?.email) ? ROLES.ADMIN : ROLES.USER;

    const user = {
      ...data,
      role: role as "ADMIN" | "USER",
      id: createAppId(),
    };
    return await this.userRepository.createUser(user);
  }
}
