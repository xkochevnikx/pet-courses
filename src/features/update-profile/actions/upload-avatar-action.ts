"use server";
import { File } from "node:buffer";

import { BadRequest } from "@/shared/lib/errors";

import { AVATAR_FILE_KEY } from "../constants";

export const uploadAvatarAction = async (formData: FormData) => {
  const file = formData.get(AVATAR_FILE_KEY);
  if (!(file instanceof File)) {
    throw new BadRequest();
  }

  //   const storedFile = await fileStorage.uploadImage(file, AVATAR_FILE_KEY);
};
