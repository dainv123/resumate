import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'standalone', // Temporarily disabled for development
  outputFileTracingRoot: __dirname, // Fix for multiple lockfiles warning
  serverExternalPackages: [], // Fix for routesManifest.dataRoutes error
  env: {
    PORT: process.env.PORT || '3000',
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
  publicRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
};

export default nextConfig;