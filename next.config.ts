import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This disables ESLint checking during build
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
