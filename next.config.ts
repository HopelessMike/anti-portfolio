import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Fix "workspace root inferred" warnings when the repo contains multiple lockfiles.
    root: __dirname,
  },
};

export default nextConfig;
