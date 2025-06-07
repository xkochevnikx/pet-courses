import { UserEntity, UserId } from "@/kernel/domain/types";
import { dbClient } from "@/shared/lib/db";

class UserRepository {
  async createUser(user: UserEntity): Promise<UserEntity> {
    return await dbClient.user.create({ data: user });
  }

  async getUser(id: UserId): Promise<UserEntity> {
    return await dbClient.user.findUniqueOrThrow({ where: { id } });
  }
}

export const userRepository = new UserRepository();
