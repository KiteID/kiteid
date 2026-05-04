import { createWalletClient, defineChain, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const pk = process.env.RELAYER_PRIVATE_KEY;
const rpcUrl = process.env.KITE_TESTNET_RPC_URL || 'https://rpc-testnet.gokite.ai/';
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '2368');

// Define chain explicitly so writeContract encodes transactions correctly
const kiteChain = defineChain({
  id: chainId,
  name: chainId === 2366 ? 'Kite Mainnet' : 'Kite Testnet',
  nativeCurrency: { name: 'KITE', symbol: 'KITE', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
});

export const relayerAccount = pk ? privateKeyToAccount(pk as `0x${string}`) : undefined;

export const relayerWalletClient = pk
  ? createWalletClient({
      // biome-ignore lint/style/noNonNullAssertion: relayerAccount guaranteed if pk exists
      account: relayerAccount!,
      chain: kiteChain,
      transport: http(rpcUrl),
    })
  : undefined;
