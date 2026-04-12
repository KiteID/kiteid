'use client';

import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export function useKiteBalance() {
  const { address } = useAccount();
  const balance = useBalance({ address });

  return {
    ...balance,
    formatted: balance.data ? formatEther(balance.data.value) : '0',
    symbol: balance.data?.symbol ?? 'KITE',
  };
}
