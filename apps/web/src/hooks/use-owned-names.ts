'use client';

import { useAccount } from 'wagmi';

// TODO: Replace with Ponder indexer query in Phase 3
export function useOwnedNames() {
  const { address } = useAccount();

  return {
    data: [] as string[],
    isLoading: false,
    isEmpty: true,
    address,
  };
}
