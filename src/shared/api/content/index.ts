import { privateEnv } from "@/shared/lib/env/parse-private-env";

import { queryClient } from "../query-client";

import { CacheStrategy } from "./lib/cache-strategy";
import { ContentApi } from "./lib/content-api";
import { ContentParser } from "./lib/content-parser";
import { FileFetcher } from "./lib/file-fetcher";

const fetcher = new FileFetcher(privateEnv.CONTENT_TOKEN);

const parser = new ContentParser();

const cache = new CacheStrategy(queryClient);

export const contentApi = new ContentApi(privateEnv.CONTENT_URL, {
  cacheStrategy: cache,
  contentParser: parser,
  fileFetcher: fetcher,
});
