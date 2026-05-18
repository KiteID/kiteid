import { createPublicClient, createWalletClient, defineChain, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const pk = process.env.RELAYER_PRIVATE_KEY;
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '2368');

// Select RPC URL based on chainId — mainnet (2366) uses different RPC than testnet (2368)
const rpcUrl =
  chainId === 2366
    ? process.env.KITE_RPC_URL || 'https://rpc.gokite.ai/'
    : process.env.KITE_TESTNET_RPC_URL || 'https://rpc-testnet.gokite.ai/';

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

// Read-only client shared by relay handlers (simulateContract, ownerOf reads,
// etc.). Keeping it module-level avoids re-creating HTTP clients per request.
export const publicClient = createPublicClient({
  chain: kiteChain,
  transport: http(rpcUrl),
});
