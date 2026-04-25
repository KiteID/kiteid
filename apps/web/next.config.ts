import { resolve } from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: [
    '@kiteid/ui',
    '@kiteid/sdk',
    '@kiteid/contracts-abi',
    '@kiteid/api',
    '@kiteid/db',
  ],
  serverExternalPackages: ['pg', 'drizzle-orm', 'better-auth'],
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
};

export default nextConfig;
