import type { SchemaObject } from "ajv";

type CacheStrategy = {
  fetch<T>(key: unknown[], getData: () => Promise<T>): Promise<T>;
};

type ContentParser = {
  parse<T>(text: string, schema: SchemaObject): Promise<T>;
};

type FileFetcher = {
  fetchText(url: string): Promise<string>;
};

export type Deps = {
  cacheStrategy: CacheStrategy;
  contentParser: ContentParser;
  fileFetcher: FileFetcher;
};

export type CourseSlug = string;
export type LessonSlug = string;
