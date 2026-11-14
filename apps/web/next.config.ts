import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    "@regis/design-tokens",
    "@regis/domain",
    "@regis/validation",
    "@regis/api-client",
    "@regis/database",
  ],
  serverExternalPackages: ["@electric-sql/pglite", "pglite-prisma-adapter"],
  experimental: {
    // Allow the admin property form to submit several images in one request.
    serverActions: { bodySizeLimit: "12mb" },
  },
  images: {
    remotePatterns: [
      // Add approved media hosts here (object storage CDN, etc.) before use.
    ],
  },
};

export default nextConfig;
