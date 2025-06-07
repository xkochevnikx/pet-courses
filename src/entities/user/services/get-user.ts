import { SessionEntity, UserEntity, UserId } from "@/kernel/domain/types";
import { AuthorizationError } from "@/shared/lib/errors";

import { createUserAbility } from "../domain/ability";
import { userRepository } from "../repository/user";

type GetUser = {
  userId: UserId;
  session: SessionEntity;
};

export class GetUserService {
  async exec({ userId, session }: GetUser): Promise<UserEntity> {
    const userAbility = createUserAbility(session);

    if (!userAbility.canGetUser(userId)) {
      throw new AuthorizationError();
    }

    return await userRepository.getUser(userId);
  }
}

export const getUserService = new GetUserService();
