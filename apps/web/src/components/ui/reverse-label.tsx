'use client';

import { Badge } from '@kiteid/ui';

interface DomainData {
  domains: Array<{ name: string }>;
  count: number;
}

interface ReverseLabelProps {
  data?: DomainData;
}

export function ReverseLabel({ data }: ReverseLabelProps) {
  if (!data?.domains || data.domains.length === 0) {
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
