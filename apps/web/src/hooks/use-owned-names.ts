'use client';

import { type IndexedDomain, useIndexedNames } from '@kiteid/sdk';

export function useOwnedNames() {
  const { domains, count, isLoading, error, refetch } = useIndexedNames();

  return {
    data: domains.map((d: IndexedDomain) => d.name),
    domains,
    isLoading,
    isEmpty: count === 0,
    error,
    refetch,
  };
}
