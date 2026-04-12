'use client';

import { normalizeLabel, useKiteAvailable } from '@kiteid/sdk';
import { Card, CardContent, Skeleton } from '@kiteid/ui';
import { use } from 'react';
import { useChainId } from 'wagmi';
import { RegisterFlow } from '@/components/domain/register-flow';
import { WalletGuard } from '@/components/web3/wallet-guard';
import { TLD } from '@/lib/constants';

interface RegisterPageProps {
  params: Promise<{ name: string }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const { name: rawName } = use(params);
  const name = normalizeLabel(decodeURIComponent(rawName));
  const chainId = useChainId();
  const availability = useKiteAvailable(name, chainId);

  // Loading state
  if (availability.isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Name not available
  if (availability.data === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <h1 className="text-xl font-semibold text-carbon">
              {name}
              <span className="text-gold">{TLD}</span>
            </h1>
            <p className="text-bronze">This name is not available for registration.</p>
            <a
              href="/search"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-cream transition-colors hover:bg-bronze"
            >
              Search for another name
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <WalletGuard message="Domain kaydetmek için cüzdanınızı bağlayın.">
        <RegisterFlow name={name} />
      </WalletGuard>
    </div>
  );
}
