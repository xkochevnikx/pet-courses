import { z } from "zod";
export const oauthSchema = z.object({
  code: z.string().optional(),
  response_type: z.enum(["code"], {
    required_error: "Response type is required",
    message: "Response type must be 'code'",
  }),
  client_id: z.string(),
  redirect_uri: z.string(),
  state: z.string().optional(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(["S256", "plain"]).optional(),
});

export const getTokenBodySchema = z.object({
  code: z.string(),
  redirect_uri: z.string(),
  code_verifier: z.string(),
  grant_type: z.string(),
});
