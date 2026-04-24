'use client';

import { kiteAI, kiteAITestnet } from '@kiteid/sdk';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Config } from 'wagmi';

let cached: Config | undefined;

/**
 * Build the wagmi config lazily. `getDefaultConfig` (RainbowKit) eagerly
 * instantiates the WalletConnect provider which hits `indexedDB` — that
 * global doesn't exist on the server, so calling this at module import
 * time crashes SSR with `ReferenceError: indexedDB is not defined`.
 * Callers MUST only invoke this after `useEffect` runs client-side.
 */
export function getConfig(): Config {
  if (cached) return cached;

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '2368');
  const isTestnet = chainId === 2368;
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'PLACEHOLDER';

  cached = getDefaultConfig({
    appName: 'KiteID',
    projectId,
    chains: isTestnet ? [kiteAITestnet, kiteAI] : [kiteAI, kiteAITestnet],
    ssr: true,
  });

  return cached;
}
