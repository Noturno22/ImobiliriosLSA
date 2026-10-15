import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    "@serrote/design-tokens",
    "@serrote/domain",
    "@serrote/validation",
    "@serrote/api-client",
    "@serrote/database",
  ],
  serverExternalPackages: ["@electric-sql/pglite", "pglite-prisma-adapter"],
  images: {
    remotePatterns: [
      // Add approved media hosts here (object storage CDN, etc.) before use.
    ],
  },
};

export default nextConfig;
