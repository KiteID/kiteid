'use client';

import { daysUntilExpiry, useKiteNameExpiry, useKiteNameOwner, useKiteResolver } from '@kiteid/sdk';
import { useChainId } from 'wagmi';

export function useNameDetails(name: string) {
  const chainId = useChainId();
  const expiry = useKiteNameExpiry(name, chainId);
  const owner = useKiteNameOwner(name, chainId);
  const resolver = useKiteResolver(name, chainId);

  const expiryTimestamp = expiry.data ? Number(expiry.data) : undefined;
  const daysLeft = expiryTimestamp ? daysUntilExpiry(BigInt(expiryTimestamp)) : undefined;

  return {
    owner: owner.data as `0x${string}` | undefined,
    resolver: resolver.data as `0x${string}` | undefined,
    expiryTimestamp,
    daysLeft,
    isLoading: expiry.isLoading || owner.isLoading || resolver.isLoading,
    isExpired: daysLeft !== undefined && daysLeft <= 0,
  };
}
