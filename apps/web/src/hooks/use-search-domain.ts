'use client';

import {
  normalizeLabel,
  useKiteAvailable,
  useKiteIsReserved,
  useKiteRentPrice,
  yearsToSeconds,
} from '@kiteid/sdk';
import { useChainId } from 'wagmi';

export function useSearchDomain(name: string | undefined) {
  const chainId = useChainId();
  const label = name ? normalizeLabel(name) : undefined;
  const duration = yearsToSeconds(1);

  const availability = useKiteAvailable(label, chainId);
  const reserved = useKiteIsReserved(label, chainId);
  const price = useKiteRentPrice(label, duration, chainId);

  return {
    name: label,
    isAvailable: availability.data,
    isReserved: reserved.data,
    isLoading: availability.isLoading || reserved.isLoading,
    price: price.data ? { base: price.data.base, premium: price.data.premium } : undefined,
    isPriceLoading: price.isLoading,
  };
}
