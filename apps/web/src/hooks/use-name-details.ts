'use client';

import { daysUntilExpiry, useKiteNameExpiry, useKiteNameOwner, useKiteResolver } from '@kiteid/sdk';
import { useChainId } from 'wagmi';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useNameDetails(name: string) {
  const chainId = useChainId();
  const expiry = useKiteNameExpiry(name, chainId);
  const owner = useKiteNameOwner(name, chainId);
  const resolver = useKiteResolver(name, chainId);

  const expiryTimestamp = expiry.data ? Number(expiry.data) : undefined;
  const daysLeft = expiryTimestamp ? daysUntilExpiry(BigInt(expiryTimestamp)) : undefined;
  const ownerAddr = owner.data as `0x${string}` | undefined;

  // A name is registered only when on-chain owner is not the zero address
  // AND expiry is in the future. Without both, we can't claim ACTIVE.
  const isRegistered =
    ownerAddr !== undefined &&
    ownerAddr.toLowerCase() !== ZERO_ADDRESS &&
    expiryTimestamp !== undefined &&
    expiryTimestamp > 0;

  const hasError = expiry.isError || owner.isError || resolver.isError;

  return {
    owner: ownerAddr,
    resolver: resolver.data as `0x${string}` | undefined,
    expiryTimestamp,
    daysLeft,
    isLoading: expiry.isLoading || owner.isLoading || resolver.isLoading,
    isRegistered,
    hasError,
    isExpired: isRegistered && daysLeft !== undefined && daysLeft <= 0,
  };
}
