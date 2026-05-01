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
