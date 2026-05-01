import { useQuery } from '@tanstack/react-query';

interface DomainData {
  domains: Array<{ name: string }>;
  count: number;
}

type BatchResult = Record<string, DomainData | undefined>;

/**
 * Batch reverse lookup hook - fetches domain names for multiple addresses in a single API call.
 * Uses a dedicated /api/names/owners?addresses=0x1,0x2,... endpoint to avoid N+1 requests.
 */
export function useReverseBatch(addresses: string[]): BatchResult {
  const uniqueAddresses = [...new Set(addresses.map((a) => a.toLowerCase()))];

  const { data = {} } = useQuery<BatchResult>({
    queryKey: ['reverse-batch', JSON.stringify(uniqueAddresses.sort())],
    queryFn: async () => {
      if (uniqueAddresses.length === 0) return {};

      try {
        const queryString = uniqueAddresses.join(',');
        const res = await fetch(`/api/names/owners?addresses=${queryString}`);
        if (res.ok) {
          const { owners } = await res.json();
          return owners as BatchResult;
        }
      } catch {
        // Silently fail and return empty
      }
      return {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: uniqueAddresses.length > 0,
  });

  return data;
}
