import { injectable } from "inversify";

import {
  createProfileAbility,
  createUserAbility,
} from "@/entities/user/server-index";
import { authorizedProcedure } from "@/shared/lib/trpc/procedure";
import { Controller, router } from "@/shared/lib/trpc/server";
import {
  GetProfileService,
  UpdateProfileService,
} from "@/shared/types/abstract-classes";

import { AVATAR_FILE_KEY } from "./constants";
import { deserializeBase64ToBytes } from "./model/lib/helpers";
import {
  updateProfileSchema,
  uploadFileSchema,
  withUserIdSchema,
} from "./model/schema";

@injectable()
export class UpdateProfileController extends Controller {
  constructor(
    private getProfileService: GetProfileService,
    private updateProfileService: UpdateProfileService,
  ) {
    super();
  }

  public router = router({
    updateProfile: router({
      get: authorizedProcedure({
        schemaParse: withUserIdSchema,
        check: (ability, input) => ability.canGetUser(input.userId),
        create: createUserAbility,
      }).query(async ({ input }) => {
        const { userId } = input;
        return await this.getProfileService.exec({ userId });
      }),
      update: authorizedProcedure({
        schemaParse: updateProfileSchema,
        check: (ability, input) => ability.canUpdateProfile(input.userId),
        create: createProfileAbility,
      }).mutation(async ({ input }) => {
        return await this.updateProfileService.exec(input);
      }),
      uploadAvatar: authorizedProcedure({
        schemaParse: uploadFileSchema,
        check: (ability, input) => ability.canUpdateProfile(input.userId),
        create: createProfileAbility,
      }).mutation(async ({ input }) => {
        const { avatar, userId } = input;
        const deserializeFile = deserializeBase64ToBytes(avatar);
        return await this.updateProfileService.uploadAvatar(
          { ...deserializeFile, id: userId },
          AVATAR_FILE_KEY,
        );
      }),
    }),
  });
}
