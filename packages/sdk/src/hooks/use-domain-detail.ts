'use client';

import { useQuery } from '@tanstack/react-query';
import { ponderClient } from '../api/ponder-client';

export function useDomainDetail(name: string | undefined) {
  const query = useQuery({
    queryKey: ['domainDetail', name],
    queryFn: () => ponderClient.getDomainDetail(name as string),
    enabled: !!name,
    staleTime: 30_000,
  });

  return {
    domain: query.data?.domain,
    records: query.data?.records ?? [],
    events: query.data?.events ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
