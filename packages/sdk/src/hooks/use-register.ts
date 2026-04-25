'use client';

import { useWriteContract } from 'wagmi';
import { abis, getControllerAddress } from '../contracts';
import type { RegistrationParams } from '../types';

const PRICE_BUFFER_PERCENT = 5n;

export function useKiteRegister(chainId?: number) {
  const { writeContract, writeContractAsync, ...rest } = useWriteContract();

  const register = (params: RegistrationParams, totalPrice: bigint) => {
    if (!chainId) return;
    const address = getControllerAddress(chainId);
    if (!address) return;
    const valueWithBuffer = totalPrice + (totalPrice * PRICE_BUFFER_PERCENT) / 100n;

    writeContract({
      address,
      abi: abis.controller,
      functionName: 'register',
      args: [
        params.name,
        params.owner,
        params.duration,
        params.secret,
        params.resolver,
        params.data,
        params.reverseRecord,
      ],
      value: valueWithBuffer,
    });
  };

  const registerAsync = (params: RegistrationParams, totalPrice: bigint) => {
    if (!chainId) throw new Error('Chain ID not set');
    const address = getControllerAddress(chainId);
    if (!address) throw new Error(`Unsupported chain ID: ${chainId}`);
    const valueWithBuffer = totalPrice + (totalPrice * PRICE_BUFFER_PERCENT) / 100n;

    return writeContractAsync({
      address,
      abi: abis.controller,
      functionName: 'register',
      args: [
        params.name,
        params.owner,
        params.duration,
        params.secret,
        params.resolver,
        params.data,
        params.reverseRecord,
      ],
      value: valueWithBuffer,
    });
  };

  return { register, registerAsync, ...rest };
}
