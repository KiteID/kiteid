'use client';

import { type UseWriteContractReturnType, useWriteContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';
import { normalizeLabel } from '../utils/name-validation';

const PRICE_BUFFER_PERCENT = 5n;

type WriteRest = Omit<UseWriteContractReturnType, 'writeContract' | 'writeContractAsync'>;

export function useKiteRenew(chainId?: number): {
  renew: (name: string, duration: bigint, totalPrice: bigint) => void;
  renewAsync: (name: string, duration: bigint, totalPrice: bigint) => Promise<`0x${string}`>;
} & WriteRest {
  const { writeContract, writeContractAsync, ...rest } = useWriteContract();

  const renew = (name: string, duration: bigint, totalPrice: bigint) => {
    if (!chainId) return;
    const address = getControllerAddress(chainId);
    if (!address) return;
    const label = normalizeLabel(name);
    const valueWithBuffer = totalPrice + (totalPrice * PRICE_BUFFER_PERCENT) / 100n;

    writeContract({
      address,
      abi: abis.controller,
      functionName: 'renew',
      args: [label, duration],
      value: valueWithBuffer,
    });
  };

  const renewAsync = (name: string, duration: bigint, totalPrice: bigint) => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getControllerAddress(chainId);
    if (!address) throw new Error(`Unsupported chain ID: ${chainId}`);
    const label = normalizeLabel(name);
    const valueWithBuffer = totalPrice + (totalPrice * PRICE_BUFFER_PERCENT) / 100n;

    return writeContractAsync({
      address,
      abi: abis.controller,
      functionName: 'renew',
      args: [label, duration],
      value: valueWithBuffer,
    });
  };

  return { renew, renewAsync, ...rest };
}
