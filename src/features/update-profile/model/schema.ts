import { z } from "zod";

export const profileFormSchema = z.object({
  name: z
    .string()
    .max(30, { message: "UserName must not be longer 30 characters" })
    .transform((name) => name.trim())
    .optional(),

  email: z.string().optional(),
  image: z.string().optional(),
});
