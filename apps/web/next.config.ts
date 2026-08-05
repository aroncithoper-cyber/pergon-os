import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    "@pergon/ui",
    "@pergon/shared",
    "@pergon/database",
    "@pergon/identity",
    "@pergon/auth",
    "@pergon/three",
  ],
};

export default nextConfig;
