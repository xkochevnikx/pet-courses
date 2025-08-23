import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  rewrites: async () => [
    {
      source: "/storage/:path*",
      destination: `${process.env.S3_ENDPOINT}/:path*`,
    },
  ],
};

export default nextConfig;
