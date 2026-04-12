'use client';

import { useReadContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';
import { normalizeLabel } from '../utils/name-validation';

export function useKiteAvailable(name: string | undefined, chainId?: number) {
  const label = name ? normalizeLabel(name) : '';

  return useReadContract({
    address: chainId ? getControllerAddress(chainId) : undefined,
    abi: abis.controller,
    functionName: 'available',
    args: [label],
    query: {
      enabled: label.length >= 3 && chainId !== undefined,
    },
  });
}
