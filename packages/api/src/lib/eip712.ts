import { recoverTypedDataAddress } from 'viem';

export const WRAP_REQUEST_TYPES = {
  WrapRequest: [
    { name: 'signer', type: 'address' },
    { name: 'node', type: 'bytes32' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'fuses', type: 'uint96' },
    { name: 'expiry', type: 'uint64' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'deadline', type: 'uint64' },
  ],
} as const;

export const UNWRAP_REQUEST_TYPES = {
  UnwrapRequest: [
    { name: 'signer', type: 'address' },
    { name: 'node', type: 'bytes32' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'deadline', type: 'uint64' },
  ],
} as const;

export function getWrapDomain(chainId: number, wrapperAddress: `0x${string}`) {
  return {
    name: 'KiteWrapper',
    version: '1',
    chainId,
    verifyingContract: wrapperAddress,
  };
}

export async function verifyRelaySignature(
  primaryType: 'WrapRequest' | 'UnwrapRequest',
  // biome-ignore lint/suspicious/noExplicitAny: viem lib requires any for dynamic types
  types: Record<string, any>,
  message: Record<string, unknown>,
  signature: `0x${string}`,
  domain: ReturnType<typeof getWrapDomain>,
): Promise<`0x${string}` | false> {
  try {
    const recovered = await recoverTypedDataAddress({
      // biome-ignore lint/suspicious/noExplicitAny: viem api requires any for domain conversion
      domain: domain as any,
      // biome-ignore lint/suspicious/noExplicitAny: viem api requires any for types object
      types: { [primaryType]: types[primaryType] } as any,
      primaryType,
      // biome-ignore lint/suspicious/noExplicitAny: viem api requires any for message conversion
      message: message as any,
      signature,
    });
    return recovered === (message.signer as `0x${string}`)
      ? (message.signer as `0x${string}`)
      : false;
  } catch {
    return false;
  }
}
