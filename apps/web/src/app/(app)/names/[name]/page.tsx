'use client';

import { normalizeLabel } from '@kiteid/sdk';
import { Button } from '@kiteid/ui';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { NameDetailCard } from '@/components/domain/name-detail-card';
import { RenewDialog } from '@/components/domain/renew-dialog';
import { useNameDetails } from '@/hooks/use-name-details';

function NameDetailContent() {
  const params = useParams<{ name: string }>();
  const searchParams = useSearchParams();
  const rawName = decodeURIComponent(params.name);
  const name = normalizeLabel(rawName);

  const details = useNameDetails(name);
  const [renewOpen, setRenewOpen] = useState(false);

  // Open renew dialog if ?renew=true query param is present
  useEffect(() => {
    if (searchParams.get('renew') === 'true') {
      setRenewOpen(true);
    }
  }, [searchParams]);

  const handleOpenRenew = useCallback(() => {
    setRenewOpen(true);
  }, []);

  const handleCloseRenew = useCallback(() => {
    setRenewOpen(false);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <Link href="/names">
          <Button variant="ghost" size="sm" className="text-bronze hover:text-carbon">
            &larr; Back to My Names
          </Button>
        </Link>
      </div>

      <NameDetailCard
        name={name}
        owner={details.owner}
        resolver={details.resolver}
        expiryTimestamp={details.expiryTimestamp}
        daysLeft={details.daysLeft}
        isExpired={details.isExpired}
        isLoading={details.isLoading}
        onRenew={handleOpenRenew}
      />

      <RenewDialog name={name} open={renewOpen} onClose={handleCloseRenew} />
    </div>
  );
}

export default function NameDetailPage() {
  return (
    <Suspense>
      <NameDetailContent />
    </Suspense>
  );
}
