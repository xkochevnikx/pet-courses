import { AuthorizationError } from "@/shared/lib/errors";

import { createUserAbility } from "../domain/ability";
import { SessionEntity, UserEntity, UserId } from "../domain/types";
import { userRepository } from "../repository/user";

type GetUser = {
  userId: UserId;
  session: SessionEntity;
};

export class GetUserUseCase {
  async exec({ userId, session }: GetUser): Promise<UserEntity> {
    const userAbility = createUserAbility(session);

    if (!userAbility.canGetUser(userId)) {
      throw new AuthorizationError();
    }

    return await userRepository.getUser(userId);
  }
}

export const getUserUseCase = new GetUserUseCase();
