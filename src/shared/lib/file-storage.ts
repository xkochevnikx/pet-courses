import { File } from "node:buffer";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { createAppId } from "./ids";
import { privateEnv } from "./parse-private-env";

export type StoredFile = {
  id: string;
  name: string;
  path: string;
  prefix: string;
  type: string;
  eTag?: string;
};

class FileStorage {
  private s3Client = new S3Client({
    forcePathStyle: true,
    endpoint: privateEnv.S3_ENDPOINT,
    region: privateEnv.S3_REGION,
    credentials: {
      accessKeyId: privateEnv.S3_ACCESS_KEY_ID,
      secretAccessKey: privateEnv.S3_SECRET_ACCESS_KEY,
    },
  });

  async uploadImage(file: File, tag: string) {
    return this.upload(file, privateEnv.S3_IMAGES_BUCKET, tag);
  }

  async upload(file: File, bucket: string, tag: string): Promise<StoredFile> {
    const res = await new Upload({
      client: this.s3Client,
      params: {
        ACL: "public-read",
        Bucket: bucket,
        Key: `${tag}-${Date.now().toString()}-${file.name}`,
        // @ts-expect-error: Node.js File is not compatible with Upload Body (expects Blob/Buffer)
        Body: file,
      },
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    }).done();

    return {
      id: createAppId(),
      name: file.name,
      type: file.type,
      path: `/storage/${bucket}/${res.Key}`,
      prefix: "/storage",
      eTag: res.ETag,
    };
  }
  
}

export const fileStorage = new FileStorage();
