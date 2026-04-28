import { useQuery } from '@tanstack/react-query';

interface DomainData {
  domains: Array<{ name: string }>;
  count: number;
}

type BatchResult = Record<string, DomainData | undefined>;

/**
 * Batch reverse lookup hook - fetches domain names for multiple addresses at once.
 * Uses React Query's batching and caching to avoid N+1 requests.
 */
export function useReverseBatch(addresses: string[]): BatchResult {
  const uniqueAddresses = [...new Set(addresses.map((a) => a.toLowerCase()))];

  const { data = {} } = useQuery<BatchResult>({
    queryKey: ['reverse-batch', JSON.stringify(uniqueAddresses.sort())],
    queryFn: async () => {
      const result: BatchResult = {};

      // Fetch all addresses in parallel
      const promises = uniqueAddresses.map(async (address) => {
        try {
          const res = await fetch(`/api/names/owner/${address}`);
          if (res.ok) {
            const data: DomainData = await res.json();
            result[address] = data;
          }
        } catch {
          // Silently fail for individual addresses
        }
      });

      await Promise.all(promises);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return data;
}
