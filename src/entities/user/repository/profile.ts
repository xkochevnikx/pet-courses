import { injectable } from "inversify";
import { z } from "zod";

import { dbClient } from "@/shared/lib/db";
import { StoredFile } from "@/shared/lib/file-storage";
import {
  FileStorage,
  ProfileRepository,
} from "@/shared/types/abstract-classes";
import { Profile, UploadBlob, UserId } from "@/shared/types/domain-types";

import { avatarPathResultSchema, profileSchema } from "../server-index";

@injectable()
export class ProfileRepositoryImp extends ProfileRepository {
  constructor(private uploadAvatar: FileStorage) {
    super();
  }
  async update(userId: UserId, data: Partial<Profile>): Promise<Profile> {
    const profile = await dbClient.user.update({
      where: {
        id: userId,
      },
      data,
    });

    return profileSchema.parse(profile satisfies z.input<typeof profileSchema>);
  }

  async getProfileById(id: UserId): Promise<Profile> {
    const profile = await dbClient.user.findUniqueOrThrow({ where: { id } });
    return profileSchema.parse(profile satisfies z.input<typeof profileSchema>);
  }

  async uploadAvatarMethod(file: UploadBlob, tag: string): Promise<StoredFile> {
    const storedFile = await this.uploadAvatar.uploadAvatar(file, tag);
    return avatarPathResultSchema.parse(storedFile);
  }
}
