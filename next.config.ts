import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true
  },
  // Enable build caching for faster rebuilds
  cache: true
};

export default nextConfig;
