'use client';

import { useQuery } from '@tanstack/react-query';
import { ponderClient } from '../api/ponder-client';

export function useDomainStats() {
  const query = useQuery({
    queryKey: ['domainStats'],
    queryFn: () => ponderClient.getStats(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return {
    stats: query.data ?? { totalDomains: 0, activeDomains: 0, expiredDomains: 0 },
    isLoading: query.isLoading,
    error: query.error,
  };
}
