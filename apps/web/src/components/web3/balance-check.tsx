'use client';

import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';

interface BalanceCheckProps {
  requiredAmount?: bigint;
}

export function BalanceCheck({ requiredAmount }: BalanceCheckProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!balance || !requiredAmount) return null;

  const isInsufficient = balance.value < requiredAmount;

  if (!isInsufficient) return null;

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm">
      <p className="font-medium text-destructive">Yetersiz Bakiye</p>
      <p className="mt-1 text-bronze">
        Gerekli: {formatEther(requiredAmount)} KITE · Mevcut: {formatEther(balance.value)} KITE
      </p>
    </div>
  );
}
