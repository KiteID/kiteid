'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { type IndexedDomain, ponderClient } from '../api/ponder-client';

export function useIndexedNames() {
  const { address } = useAccount();

  const query = useQuery({
    queryKey: ['indexedNames', address],
    queryFn: () => ponderClient.getOwnedDomains(address as string),
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    domains: query.data?.domains ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { IndexedDomain };
