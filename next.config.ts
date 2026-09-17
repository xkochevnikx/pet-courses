import { withPayload } from "@payloadcms/next/withPayload";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },

  rewrites: async () => [
    {
      source: "/storage/:path*",
      destination: `${process.env.MINIO_INTERNAL_BASE}/:path*`,
    },
  ],
};

export default withPayload(nextConfig);
