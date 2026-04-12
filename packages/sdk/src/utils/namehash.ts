import { encodePacked, keccak256 } from 'viem';

const EMPTY_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
const KITE_TLD = 'kite';

export function labelhash(label: string): `0x${string}` {
  return keccak256(new TextEncoder().encode(label));
}

export function namehash(name: string): `0x${string}` {
  if (!name) return EMPTY_HASH;

  const labels = name.split('.');
  let node: `0x${string}` = EMPTY_HASH;

  for (let i = labels.length - 1; i >= 0; i--) {
    const label = labels[i];
    if (!label) continue;
    node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, labelhash(label)]));
  }

  return node;
}

export function kiteNamehash(label: string): `0x${string}` {
  return namehash(`${label}.${KITE_TLD}`);
}

export function kiteLabelhash(label: string): `0x${string}` {
  return labelhash(label);
}

export const KITE_NODE = namehash(KITE_TLD);
