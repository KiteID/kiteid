import { Badge } from '@kiteid/ui';

type AvailabilityStatus = 'available' | 'taken' | 'reserved' | 'loading';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
}

const statusConfig: Record<
  AvailabilityStatus,
  { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }
> = {
  available: { label: 'Available', variant: 'success' },
  taken: { label: 'Taken', variant: 'destructive' },
  reserved: { label: 'Reserved', variant: 'warning' },
  loading: { label: 'Checking...', variant: 'secondary' },
};

export function AvailabilityBadge({ status }: AvailabilityBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
