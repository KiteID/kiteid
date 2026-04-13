'use client';

import { kiteAI, kiteAITestnet } from '@kiteid/sdk';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Config } from 'wagmi';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '2368');
const isTestnet = chainId === 2368;

// WalletConnect requires a projectId — get one at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'PLACEHOLDER';

// NOTE: WalletConnect emits "indexedDB is not defined" during SSR/static generation.
// This is cosmetic — WC tries to access browser storage server-side but fails gracefully.
// Build succeeds and runtime is unaffected. ssr:true enables proper hydration.
export const config: Config = getDefaultConfig({
  appName: 'KiteID',
  projectId,
  chains: isTestnet ? [kiteAITestnet, kiteAI] : [kiteAI, kiteAITestnet],
  ssr: true,
});
