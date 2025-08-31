import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  rewrites: async () => [
    {
      source: "/storage/:path*",
      destination: `${process.env.MINIO_INTERNAL_BASE}/:path*`,
    },
  ],
};

export default nextConfig;
