import { z } from "zod";

import { AVATAR_MAX_SIZE } from "@/shared/lib/constants";

export const profileFormSchema = z.object({
  name: z
    .string()
    .max(30, { message: "UserName must not be longer 30 characters" })
    .transform((name) => name.trim())
    .optional(),

  email: z.string().optional(),
  image: z.string().optional(),
});

export const withUserIdSchema = z.object({
  userId: z.string(),
});

export const updateProfileSchema = withUserIdSchema.extend({
  data: profileFormSchema.partial(),
});

export const serializedFileSchema = z.object({
  name: z.string().min(1),
  type: z.string().default("application/octet-stream"),
  size: z.number().int().nonnegative().max(AVATAR_MAX_SIZE, "File too large"),
  lastModified: z.number().int().nonnegative(),
  data: z.string(),
});

export const uploadFileSchema = withUserIdSchema.extend({
  avatar: serializedFileSchema,
});
