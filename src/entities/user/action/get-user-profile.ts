"use server";

import { z } from "zod";

import { profileSchema } from "../domain/schema";
import { getAppSessionStrictServer } from "../server-index";
import { getUserService } from "../services/get-user";

const propsSchema = z.object({
  userId: z.string(),
});

const resultSchema = z.object({
  profile: profileSchema,
});

export const getUserProfileAction = async (
  props: z.infer<typeof propsSchema>,
) => {
  const { userId } = propsSchema.parse(props);

  const session = await getAppSessionStrictServer();

  if (session !== null) {
    const user = await getUserService.exec({ session, userId });

    return resultSchema.parse({ profile: user });
  }
};
