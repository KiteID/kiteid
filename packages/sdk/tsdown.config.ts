import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  // Force `.js` extension so package.json `exports` resolve consistently
  // (avoids tsdown's default `.mjs`).
  outExtensions: () => ({ js: '.js' }),
  // .d.ts emitted separately by `tsc -p tsconfig.build.json` so we can
  // tolerate non-portable types from wagmi/viem deep paths.
  dts: false,
  sourcemap: true,
  clean: true,
  // Mark peer/runtime deps as never-bundled so Next/Vite/Vitest dedupe them.
  // (`external` is being renamed to `deps.neverBundle` in tsdown; we keep
  // `external` for now since both still work — emits a deprecation notice.)
  external: ['@kiteid/contracts-abi', 'viem', 'wagmi', '@tanstack/react-query', 'react'],
});
