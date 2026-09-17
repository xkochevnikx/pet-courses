import { withPayload } from "@payloadcms/next/withPayload";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Не standalone: web-stage делает npm ci + next build + next start в том же контейнере.
  // standalone нужен только для образа с `node .next/standalone/server.js`.
  eslint: { ignoreDuringBuilds: true },

  rewrites: async () => [
    {
      source: "/storage/:path*",
      destination: `${process.env.MINIO_INTERNAL_BASE}/:path*`,
    },
  ],
};

export default withPayload(nextConfig);
