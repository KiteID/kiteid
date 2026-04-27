import { resolve } from 'node:path';
import { withSentryConfig } from '@sentry/nextjs';
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

export default withSentryConfig(nextConfig, {
  org: 'kiteid',
  project: 'web',
  silent: !process.env.CI,
  disableLogger: true,
  // No source map upload — self-hosted GlitchTip doesn't need Sentry CLI uploads
  sourcemaps: { disable: true },
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
  autoInstrumentAppDirectory: false,
});
