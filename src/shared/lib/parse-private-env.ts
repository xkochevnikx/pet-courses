import { z } from "zod";

const parsePrivateEnvSchema = z.object({
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
});

export const privateEnv = parsePrivateEnvSchema.parse(process.env);
