'use client';

import { useWriteContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';

export function useKiteCommit(chainId?: number) {
  const { writeContract, writeContractAsync, ...rest } = useWriteContract();

  const commit = (commitment: `0x${string}`) => {
    if (!chainId) return;
    const address = getControllerAddress(chainId);
    if (!address) return;
    writeContract({
      address,
      abi: abis.controller,
      functionName: 'commit',
      args: [commitment],
    });
  };

  const commitAsync = (commitment: `0x${string}`) => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getControllerAddress(chainId);
    if (!address) throw new Error(`Unsupported chain ID: ${chainId}`);
    return writeContractAsync({
      address,
      abi: abis.controller,
      functionName: 'commit',
      args: [commitment],
    });
  };

  return { commit, commitAsync, ...rest };
}
