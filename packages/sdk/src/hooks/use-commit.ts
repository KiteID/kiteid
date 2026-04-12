'use client';

import { useWriteContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';

export function useKiteCommit(chainId?: number) {
  const { writeContract, writeContractAsync, ...rest } = useWriteContract();

  const commit = (commitment: `0x${string}`) => {
    if (!chainId) return;
    writeContract({
      address: getControllerAddress(chainId),
      abi: abis.controller,
      functionName: 'commit',
      args: [commitment],
    });
  };

  const commitAsync = (commitment: `0x${string}`) => {
    if (!chainId) throw new Error('Chain ID not set');
    return writeContractAsync({
      address: getControllerAddress(chainId),
      abi: abis.controller,
      functionName: 'commit',
      args: [commitment],
    });
  };

  return { commit, commitAsync, ...rest };
}
