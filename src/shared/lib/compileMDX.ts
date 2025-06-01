import { bundleMDX } from "mdx-bundler";

export const CompileMdx = (source: string) => bundleMDX({ source });
