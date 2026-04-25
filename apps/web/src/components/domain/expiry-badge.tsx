'use client';

import { Badge } from '@kiteid/ui';

interface ExpiryBadgeProps {
  daysLeft: number | undefined;
  isLoading?: boolean;
}

export function ExpiryBadge({ daysLeft, isLoading }: ExpiryBadgeProps) {
  if (isLoading) return <Badge variant="secondary">Loading...</Badge>;
  if (daysLeft === undefined) return null;

  if (daysLeft <= 0) return <Badge variant="destructive">Expired</Badge>;
  if (daysLeft <= 30) return <Badge variant="destructive">{daysLeft}d left</Badge>;
  if (daysLeft <= 90) return <Badge variant="warning">{daysLeft}d left</Badge>;
  return <Badge variant="success">{daysLeft}d left</Badge>;
}
