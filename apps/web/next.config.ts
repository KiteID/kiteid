import { resolve } from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@kiteid/ui', '@kiteid/sdk', '@kiteid/contracts-abi'],
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
};

export default nextConfig;
