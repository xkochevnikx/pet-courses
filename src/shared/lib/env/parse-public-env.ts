import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const parsePublicUrl = z.object({
  isDev: z.boolean(),
  PUBLIC_URL: z.string(),
});

export const publicEnv = parsePublicUrl.parse({
  isDev: process.env.NODE_ENV === "development",
  PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
});
