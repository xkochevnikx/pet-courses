import { AuthorizationError } from "@/shared/lib/errors";

import { createProfileAbility } from "../domain/ability";
import { Profile, SessionEntity, UserId } from "../domain/types";
import { profileRepository } from "../repository/profile";

type UpdateProfile = {
  userId: UserId;
  session: SessionEntity | null;
  data: Partial<Profile>;
};

export class UpdateProfileUseCases {
  async exec({ userId, session, data }: UpdateProfile): Promise<Profile> {
    const profileAbility = createProfileAbility(session);

    if (!profileAbility.canUpdateProfile(userId)) {
      throw new AuthorizationError();
    }

    return await profileRepository.update(userId, data);
  }
}

export const updateProfileUseCases = new UpdateProfileUseCases();
