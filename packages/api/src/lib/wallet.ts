import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const pk = process.env.RELAYER_PRIVATE_KEY;

export const relayerAccount = pk ? privateKeyToAccount(pk as `0x${string}`) : undefined;

// biome-ignore lint/style/noNonNullAssertion: relayerAccount is guaranteed if pk exists
export const relayerWalletClient = pk
  ? createWalletClient({
      // biome-ignore lint/style/noNonNullAssertion: relayerAccount guaranteed if pk exists
      account: relayerAccount!,
      transport: http(process.env.KITE_TESTNET_RPC_URL || 'https://rpc-testnet.gokite.ai/'),
    })
  : undefined;
