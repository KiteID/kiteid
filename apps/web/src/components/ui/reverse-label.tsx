'use client';

import { Badge } from '@kiteid/ui';
import { useQuery } from '@tanstack/react-query';

interface DomainData {
  domains: Array<{ name: string }>;
  count: number;
}

export function ReverseLabel({ address }: { address: string }) {
  const { data, isLoading } = useQuery<DomainData>({
    queryKey: ['reverse', address.toLowerCase()],
    queryFn: async () => {
      const res = await fetch(`/api/names/owner/${address.toLowerCase()}`);
      if (!res.ok) throw new Error('Failed to fetch reverse data');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
  });

  if (isLoading || !data?.domains || data.domains.length === 0) {
    return null;
  }

  const primaryDomain = data.domains[0];
  if (!primaryDomain) return null;

  const domainList = data.domains.map((d) => `${d.name}.kite`).join(', ');

  return (
    <Badge
      variant="secondary"
      className="font-mono text-xs"
      title={`Registered names: ${domainList}`}
    >
      {primaryDomain.name}.kite
      {data.domains.length > 1 && ` +${data.domains.length - 1}`}
    </Badge>
  );
}
