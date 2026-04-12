import { encodePacked, keccak256 } from 'viem';

export function generateSecret(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`;
}

export function makeCommitment(params: {
  name: string;
  owner: `0x${string}`;
  duration: bigint;
  secret: `0x${string}`;
  resolver: `0x${string}`;
  data: `0x${string}`[];
  reverseRecord: boolean;
}): `0x${string}` {
  const dataHash =
    params.data.length > 0
      ? keccak256(
          encodePacked(
            params.data.map(() => 'bytes' as const),
            params.data,
          ),
        )
      : ('0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`);

  return keccak256(
    encodePacked(
      ['string', 'address', 'uint256', 'bytes32', 'address', 'bytes32', 'bool'],
      [
        params.name,
        params.owner,
        params.duration,
        params.secret,
        params.resolver,
        dataHash,
        params.reverseRecord,
      ],
    ),
  );
}
