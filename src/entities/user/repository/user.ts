import { injectable } from "inversify";

import { dbClient } from "@/shared/lib/db";
import { UserRepository } from "@/shared/types/abstract-classes";
import { UserEntity } from "@/shared/types/domain-types";

@injectable()
export class UserRepositoryImp extends UserRepository {
  async createUser(user: UserEntity): Promise<UserEntity> {
    return await dbClient.user.create({ data: user });
  }
}
