'use client';

import { kiteAI, kiteAITestnet } from '@kiteid/sdk';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Config } from 'wagmi';
import { cookieStorage, createStorage } from 'wagmi';

let cached: Config | undefined;

/**
 * Build the wagmi config lazily and cache it. `cookieStorage` + `ssr: true`
 * is the official wagmi v2 SSR pattern: state is serialized into a cookie
 * that the server reads via `cookieToInitialState`, so the Wagmi tree
 * renders identically on server and client (no hydration mismatch, no
 * mount gate needed). Cookie-backed storage also avoids WalletConnect's
 * `indexedDB` access on the server.
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
    storage: createStorage({ storage: cookieStorage }),
  });

  return cached;
}
