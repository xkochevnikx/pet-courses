"use server";

import { z } from "zod";

import {
  getAppSessionStrictServer,
  profileSchema,
  updateProfileUseCases,
} from "@/entities/user/server-index";

const propsSchema = z.object({
  userId: z.string(),
  data: profileSchema.partial(),
});

const resultSchema = z.object({
  profile: profileSchema,
});

export const updateProfileAction = async (
  props: z.infer<typeof propsSchema>,
) => {
  const { userId, data } = propsSchema.parse(props);

  const session = await getAppSessionStrictServer();

  const user = await updateProfileUseCases.exec({ session, data, userId });

  return resultSchema.parse({ profile: user });
};
