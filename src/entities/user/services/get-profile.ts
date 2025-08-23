import { injectable } from "inversify";

import {
  GetProfileService,
  ProfileRepository,
} from "@/shared/types/abstract-classes";
import { Profile, UserId } from "@/shared/types/domain-types";

@injectable()
export class GetProfileServiceImp extends GetProfileService {
  constructor(private userRepository: ProfileRepository) {
    super();
  }
  async exec({ userId }: { userId: UserId }): Promise<Profile> {
    return await this.userRepository.getProfileById(userId);
  }
}
