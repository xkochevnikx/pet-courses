import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const parsePrivateEnvSchema = z.object({
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  ADMIN_EMAILS: z.string().optional(),

  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_IMAGES_BUCKET: z.string(),
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),

  SCHEMA_DIR: z.string(),
  OUTPUT_DIR: z.string(),
  SCHEMA_FILES: z.string(),

  CONTENT_URL: z.string(),
  CONTENT_TOKEN: z.string().optional(),
});

export const privateEnv = parsePrivateEnvSchema.parse(process?.env);
