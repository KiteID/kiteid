'use client';

import { useReadContract } from 'wagmi';
import { abis, getAddresses } from '../contracts';
import { normalizeLabel } from '../utils/name-validation';
import { labelhash } from '../utils/namehash';

export function useKiteNameExpiry(name: string, chainId?: number) {
  const label = normalizeLabel(name);
  const tokenId = labelhash(label);

  return useReadContract({
    address: chainId ? getAddresses(chainId).baseRegistrar : undefined,
    abi: abis.baseRegistrar,
    functionName: 'nameExpires',
    args: [BigInt(tokenId)],
    query: { enabled: !!chainId && !!name },
  });
}
