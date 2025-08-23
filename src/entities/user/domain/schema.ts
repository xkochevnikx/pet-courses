import { z } from "zod";

export const profileSchema = z.object({
  email: z.string(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export const avatarPathResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  prefix: z.string(),
  type: z.string(),
  eTag: z.string().optional(),
});
