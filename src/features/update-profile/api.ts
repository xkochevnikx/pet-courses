import { createApi, createHttpServerApi } from "@/shared/lib/trpc/client";

import { UpdateProfileController } from "./controller";

export const updateProfileApi = createApi<UpdateProfileController["router"]>();

export const updateProfileApiServer =
  createHttpServerApi<UpdateProfileController["router"]>();
