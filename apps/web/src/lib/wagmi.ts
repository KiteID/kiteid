import { createKiteConfig } from '@kiteid/sdk';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '2368');

export const config = createKiteConfig({
  testnet: chainId === 2368,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});
