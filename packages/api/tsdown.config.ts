import { defineConfig } from 'tsdown';

export default defineConfig({
  // Two entries — `index` for the Hono app, `auth` for the Better Auth
  // instance (used directly inside the API package only).
  entry: ['src/index.ts', 'src/auth.ts'],
  format: ['esm'],
  outDir: 'dist',
  outExtensions: () => ({ js: '.js' }),
  // Better Auth's inferred type references zod's internal `$strip` symbol
  // which can't be portably emitted; emit `.d.ts` separately via tsc and
  // exclude `auth.ts` from the public type surface.
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
