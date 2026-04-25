'use client';

import { normalizeLabel, useDomainDetail } from '@kiteid/sdk';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { NameDetailCard } from '@/components/domain/name-detail-card';
import { RenewDialog } from '@/components/domain/renew-dialog';
import { FadeIn } from '@/components/motion';
import { useNameDetails } from '@/hooks/use-name-details';

function NameDetailContent() {
  const params = useParams<{ name: string }>();
  const searchParams = useSearchParams();
  const rawName = decodeURIComponent(params.name);
  const name = normalizeLabel(rawName);

  const details = useNameDetails(name);
  const indexed = useDomainDetail(name);
  const { address } = useAccount();

  const [renewOpen, setRenewOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('renew') === 'true') {
      setRenewOpen(true);
    }
  }, [searchParams]);

  const handleOpenRenew = useCallback(() => setRenewOpen(true), []);
  const handleCloseRenew = useCallback(() => setRenewOpen(false), []);

  const isOwner = Boolean(
    address && details.owner && address.toLowerCase() === details.owner.toLowerCase(),
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/names"
            className="inline-flex min-h-[44px] items-center gap-1 text-bronze transition-colors hover:text-carbon"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Names</span>
          </Link>
          <span className="text-stone">/</span>
          <span className="font-display text-sm text-carbon">
            {name}
            <span className="text-gold">.kite</span>
          </span>
        </nav>
      </FadeIn>

      <NameDetailCard
        name={name}
        owner={details.owner}
        resolver={details.resolver}
        expiryTimestamp={details.expiryTimestamp}
        daysLeft={details.daysLeft}
        isExpired={details.isExpired}
        isLoading={details.isLoading}
        isOwner={isOwner}
        isRegistered={details.isRegistered}
        hasError={details.hasError}
        records={indexed.records}
        domain={indexed.domain}
        events={indexed.events}
        onRenew={handleOpenRenew}
      />

      <RenewDialog name={name} open={renewOpen} onClose={handleCloseRenew} />
    </section>
  );
}

export default function NameDetailPage() {
  return (
    <Suspense>
      <NameDetailContent />
    </Suspense>
  );
}
