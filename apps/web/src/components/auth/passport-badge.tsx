'use client';

import { Badge } from '@kiteid/ui';
import { Zap } from 'lucide-react';

export function PassportBadge({ agentId }: { agentId?: string }) {
  if (!agentId) return null;

  return (
    <Badge variant="success" className="inline-flex items-center gap-1.5 font-mono text-xs">
      <Zap className="h-3 w-3" strokeWidth={2} />
      Agent Verified
    </Badge>
  );
}
