'use client';

import { useReadContract } from 'wagmi';
import { abis, getAddresses } from '../contracts';
import { normalizeLabel } from '../utils/name-validation';
import { kiteNamehash } from '../utils/namehash';

export function useKiteNameOwner(name: string, chainId?: number) {
  const label = normalizeLabel(name);
  const node = kiteNamehash(label);

  return useReadContract({
    address: chainId ? getAddresses(chainId).registry : undefined,
    abi: abis.registry,
    functionName: 'owner',
    args: [node as `0x${string}`],
    query: { enabled: !!chainId && !!name },
  });
}
