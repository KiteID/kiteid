'use client';

import type { Address } from 'viem';
import type { UseWriteContractReturnType } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { abis, getWrapperAddress } from '../contracts';

export function useWrapName(chainId?: number): Omit<
  UseWriteContractReturnType,
  'writeContract' | 'writeContractAsync'
> & {
  wrapAsync: (
    node: `0x${string}`,
    tokenId: bigint,
    owner: Address,
    fuses: bigint,
    expiry: bigint,
  ) => Promise<`0x${string}`>;
  unwrapAsync: (node: `0x${string}`, tokenId: bigint, owner: Address) => Promise<`0x${string}`>;
  setFusesAsync: (node: `0x${string}`, fuses: bigint) => Promise<`0x${string}`>;
  bindPassportAsync: (node: `0x${string}`, commitment: `0x${string}`) => Promise<`0x${string}`>;
} {
  const { writeContractAsync, ...rest } = useWriteContract();

  const wrapAsync = (
    node: `0x${string}`,
    tokenId: bigint,
    owner: Address,
    fuses: bigint,
    expiry: bigint,
  ): Promise<`0x${string}`> => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getWrapperAddress(chainId);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }
    return writeContractAsync({
      address,
      abi: abis.wrapper,
      functionName: 'wrap',
      args: [node, tokenId, owner, fuses, expiry],
    });
  };

  const unwrapAsync = (
    node: `0x${string}`,
    tokenId: bigint,
    owner: Address,
  ): Promise<`0x${string}`> => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getWrapperAddress(chainId);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }
    return writeContractAsync({
      address,
      abi: abis.wrapper,
      functionName: 'unwrap',
      args: [node, tokenId, owner],
    });
  };

  const setFusesAsync = (node: `0x${string}`, fuses: bigint): Promise<`0x${string}`> => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getWrapperAddress(chainId);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }
    return writeContractAsync({
      address,
      abi: abis.wrapper,
      functionName: 'setFuses',
      args: [node, fuses],
    });
  };

  const bindPassportAsync = (
    node: `0x${string}`,
    commitment: `0x${string}`,
  ): Promise<`0x${string}`> => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getWrapperAddress(chainId);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('KiteWrapper not deployed on this network');
    }
    return writeContractAsync({
      address,
      abi: abis.wrapper,
      functionName: 'bindPassport',
      args: [node, commitment],
    });
  };

  return { wrapAsync, unwrapAsync, setFusesAsync, bindPassportAsync, ...rest };
}
