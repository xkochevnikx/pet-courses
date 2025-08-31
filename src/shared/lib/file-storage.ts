import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { ContainerModule, injectable } from "inversify";

import { FileStorage } from "../types/abstract-classes";
import { UploadBlob } from "../types/domain-types";

import { AVATAR_MAX_SIZE } from "./constants";
import { privateEnv } from "./env/parse-private-env";
import { createAppId } from "./ids";

export type StoredFile = {
  id: string;
  name: string;
  path: string;
  prefix: string;
  type: string;
  eTag?: string;
};

@injectable()
export class FileStorageImp extends FileStorage {
  private s3Client = new S3Client({
    forcePathStyle: true,
    endpoint: privateEnv.S3_ENDPOINT,
    region: privateEnv.S3_REGION,
    credentials: {
      accessKeyId: privateEnv.S3_ACCESS_KEY_ID,
      secretAccessKey: privateEnv.S3_SECRET_ACCESS_KEY,
    },
  });

  async uploadAvatar(file: UploadBlob, tag: string) {
    return this.upload(file, privateEnv.S3_BUCKET, tag);
  }

  async upload(
    file: UploadBlob,
    bucket: string,
    tag: string,
  ): Promise<StoredFile> {
    const res = await new Upload({
      client: this.s3Client,
      params: {
        ACL: "public-read",
        Bucket: bucket,
        Key: `${tag}-${Date.now().toString()}-${file.name}`,
        Body: Buffer.from(file.bytes),
      },
      queueSize: 4, // optional concurrency configuration
      partSize: AVATAR_MAX_SIZE, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    }).done();

    return {
      id: createAppId(),
      name: file.name,
      type: file.type,
      path: `/storage/${String(res.Key)}`,
      prefix: "/storage",
      eTag: res.ETag,
    };
  }
}

export const FileStorageModule = new ContainerModule((bind) => {
  bind(FileStorage).to(FileStorageImp);
});
