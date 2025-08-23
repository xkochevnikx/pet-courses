import { z } from "zod";

import { serializedFileSchema } from "./schema";

export type SerializedFile = z.infer<typeof serializedFileSchema>;

export type DeserializedFile = Omit<SerializedFile, "data"> & {
  bytes: Uint8Array;
};
