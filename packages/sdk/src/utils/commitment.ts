import { encodeAbiParameters, keccak256 } from 'viem';

export function generateSecret(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`;
}

/**
 * Compute commitment hash matching KiteController._makeCommitment:
 *   keccak256(abi.encode(name, owner, duration, secret, resolver, data, reverseRecord))
 */
export function makeCommitment(params: {
  name: string;
  owner: `0x${string}`;
  duration: bigint;
  secret: `0x${string}`;
  resolver: `0x${string}`;
  data: `0x${string}`[];
  reverseRecord: boolean;
}): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'string', name: 'name' },
        { type: 'address', name: 'owner' },
        { type: 'uint256', name: 'duration' },
        { type: 'bytes32', name: 'secret' },
        { type: 'address', name: 'resolver' },
        { type: 'bytes[]', name: 'data' },
        { type: 'bool', name: 'reverseRecord' },
      ],
      [
        params.name,
        params.owner,
        params.duration,
        params.secret,
        params.resolver,
        params.data,
        params.reverseRecord,
      ],
    ),
  );
}
