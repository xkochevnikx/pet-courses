import { getPayload } from "payload";

import config from "@payload-config";

export const getPayloadApi = async () => {
  return getPayload({ config });
};
