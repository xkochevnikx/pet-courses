import { AVATAR_MAX_SIZE } from "@/shared/lib/constants";

import { DeserializedFile, SerializedFile } from "../types";

export async function serializeFileToBase64(
  file: File,
): Promise<SerializedFile> {
  if (file.size > AVATAR_MAX_SIZE) {
    throw new Error(`Max ${AVATAR_MAX_SIZE} bytes, got ${file.size}`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  const base64 = btoa(binary);

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    data: base64,
  };
}

export const deserializeBase64ToBytes = (
  input: SerializedFile,
): DeserializedFile => {
  const buf = Buffer.from(input.data, "base64");
  return {
    ...input,
    bytes: new Uint8Array(buf),
  };
};
