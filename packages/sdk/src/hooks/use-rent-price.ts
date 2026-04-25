'use client';

import { useReadContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';
import { normalizeLabel } from '../utils/name-validation';

export function useKiteRentPrice(
  name: string | undefined,
  duration: bigint | undefined,
  chainId?: number,
) {
  const label = name ? normalizeLabel(name) : '';

  return useReadContract({
    address: chainId ? getControllerAddress(chainId) : undefined,
    abi: abis.controller,
    functionName: 'rentPrice',
    args: [label, duration ?? 0n],
    query: {
      enabled:
        label.length >= 3 && duration !== undefined && duration > 0n && chainId !== undefined,
    },
  });
}
