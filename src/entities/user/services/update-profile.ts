import { injectable } from "inversify";

import { StoredFile } from "@/shared/lib/file-storage";
import {
  ProfileRepository,
  UpdateProfileService,
} from "@/shared/types/abstract-classes";
import {
  Profile,
  UpdateProfile,
  UploadBlob,
} from "@/shared/types/domain-types";

@injectable()
export class UpdateProfileServiceImp extends UpdateProfileService {
  constructor(private profileRepository: ProfileRepository) {
    super();
  }
  async exec({ userId, data }: UpdateProfile): Promise<Profile> {
    return await this.profileRepository.update(userId, data);
  }
  async uploadAvatar(file: UploadBlob, tag: string): Promise<StoredFile> {
    return await this.profileRepository.uploadAvatarMethod(file, tag);
  }
}
