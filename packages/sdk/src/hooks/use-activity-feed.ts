'use client';

import { useQuery } from '@tanstack/react-query';
import { type ActivityEvent, ponderClient } from '../api/ponder-client';

export function useActivityFeed(limit = 50) {
  const query = useQuery({
    queryKey: ['activityFeed', limit],
    queryFn: () => ponderClient.getRecentActivity(limit),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return {
    events: query.data?.events ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { ActivityEvent };
