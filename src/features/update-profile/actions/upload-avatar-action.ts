"use server";
import { File } from "node:buffer";

import { z } from "zod";

import { BadRequest } from "@/shared/lib/errors";
import { fileStorage } from "@/shared/lib/file-storage";

import { AVATAR_FILE_KEY } from "../constants";

const resultSchema = z.object({
  avatar: z.object({
    path: z.string(),
  }),
});

export const uploadAvatarAction = async (formData: FormData) => {
  const file = formData.get(AVATAR_FILE_KEY);
  if (!(file instanceof File)) {
    throw new BadRequest();
  }

  const storedFile = await fileStorage.uploadImage(file, AVATAR_FILE_KEY);
  console.log("🚀 ~ uploadAvatarAction ~ storedFile:", storedFile);

  return resultSchema.parse({ avatar: storedFile });
};
