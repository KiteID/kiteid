'use client';

import { useReadContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';

export function useKiteCommitments(commitment: `0x${string}` | undefined, chainId?: number) {
  return useReadContract({
    address: chainId ? getControllerAddress(chainId) : undefined,
    abi: abis.controller,
    functionName: 'commitments',
    args: commitment ? [commitment] : undefined,
    query: {
      enabled: commitment !== undefined && chainId !== undefined,
    },
  });
}
