'use client';

import {
  normalizeLabel,
  useKiteAvailable,
  useKiteIsReserved,
  useKiteRentPrice,
  yearsToSeconds,
} from '@kiteid/sdk';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useChainId } from 'wagmi';

const SEARCH_TOAST_ID = 'kiteid-search';

export function useSearchDomain(name: string | undefined) {
  const chainId = useChainId();
  const label = name ? normalizeLabel(name) : undefined;
  const duration = yearsToSeconds(1);

  const availability = useKiteAvailable(label, chainId);
  const reserved = useKiteIsReserved(label, chainId);
  const price = useKiteRentPrice(label, duration, chainId);

  // Surface query errors to the user — we do NOT throw, only advise.
  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    const err = availability.error || reserved.error;
    if (err && lastErrorRef.current !== err.message) {
      toast.error("Couldn't check availability", {
        id: SEARCH_TOAST_ID,
        description: 'The Kite network request failed. Please retry in a moment.',
      });
      lastErrorRef.current = err.message;
    } else if (!err) {
      lastErrorRef.current = null;
    }
  }, [availability.error, reserved.error]);

  return {
    name: label,
    isAvailable: availability.data,
    isReserved: reserved.data,
    isLoading: availability.isLoading || reserved.isLoading,
    price: price.data ? { base: price.data.base, premium: price.data.premium } : undefined,
    isPriceLoading: price.isLoading,
  };
}
