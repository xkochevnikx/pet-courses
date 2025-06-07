import { ROLES } from "@/kernel/domain/types";
import { privateEnv } from "@/shared/lib/env/parse-private-env";
import { createAppId } from "@/shared/lib/ids";

import { userRepository } from "../repository/user";

export type CreateUser = {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};

class CreateUserService {
  async exec(data: CreateUser) {
    const adminEmails = privateEnv.ADMIN_EMAILS?.split(",") ?? [];
    const role = adminEmails.includes(data?.email) ? ROLES.ADMIN : ROLES.USER;

    const user = {
      ...data,
      role: role as "ADMIN" | "USER",
      id: createAppId(),
    };
    return await userRepository.createUser(user);
  }
}

export const createUserService = new CreateUserService();
