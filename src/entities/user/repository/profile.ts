import { UserId } from "@/kernel/domain/types";
import { dbClient } from "@/shared/lib/db";

import { Profile } from "../domain/types";

export class ProfileRepository {
  async update(userId: UserId, data: Partial<Profile>): Promise<Profile> {
    return await dbClient.user.update({
      where: {
        id: userId,
      },
      data,
    });
  }
}

export const profileRepository = new ProfileRepository();
