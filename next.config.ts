import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This disables ESLint checking during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
