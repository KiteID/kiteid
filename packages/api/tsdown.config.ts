import { defineConfig } from 'tsdown';

export default defineConfig({
  // Single entry — `index` for the Hono app; `auth` imported internally
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  outExtensions: () => ({ js: '.js' }),
  // Better Auth's inferred type references zod's internal `$strip` symbol
  // which can't be portably emitted; skip bundling auth.ts types.
  dts: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  target: 'node22',
  external: [
    '@kiteid/db',
    'better-auth',
    'better-auth/adapters/drizzle',
    'better-auth/plugins/siwe',
    'drizzle-orm',
    'hono',
    'viem',
    'node:crypto',
  ],
});
