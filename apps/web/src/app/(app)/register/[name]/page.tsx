'use client';

import { normalizeLabel, useKiteAvailable } from '@kiteid/sdk';
import { ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useChainId } from 'wagmi';
import { RegisterFlow } from '@/components/domain/register-flow';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { WalletGuard } from '@/components/web3/wallet-guard';
import { TLD } from '@/lib/constants';

interface RegisterPageProps {
  params: Promise<{ name: string }>;
}

function suggestionsFor(name: string) {
  const base = name.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'name';
  return [`${base}1`, `${base}-dao`, `real-${base}`];
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const { name: rawName } = use(params);
  const name = normalizeLabel(decodeURIComponent(rawName));
  const chainId = useChainId();
  const availability = useKiteAvailable(name, chainId);

  // Loading state
  if (availability.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-6">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-24 w-2/3 rounded-lg animate-shimmer" />
          <div className="h-[400px] w-full rounded-2xl animate-shimmer" />
        </div>
      </div>
    );
  }

  // Name not available — editorial block
  if (availability.data === false) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FadeIn>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-bronze transition-colors hover:text-carbon"
          >
            <ChevronLeft className="h-3 w-3" strokeWidth={1.8} />
            Back to search
          </Link>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-6 flex items-baseline font-display text-6xl leading-none text-carbon sm:text-7xl">
            <span className="truncate">{name}</span>
            <span className="ml-1 text-4xl text-gold sm:text-5xl">{TLD}</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 rounded-2xl border border-red-900/10 bg-red-50/30 p-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800">
              Unavailable
            </span>
            <p className="mt-3 font-display text-2xl text-carbon">This name is taken.</p>
            <p className="mt-2 text-sm text-bronze">
              Someone else already holds this record. You can view its owner and expiry, or try one
              of the alternatives below.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/names/${encodeURIComponent(name)}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-carbon px-5 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
              >
                View record
              </Link>
              <Link
                href="/search"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-sand-core bg-cream px-5 text-sm font-medium text-bronze transition-colors hover:bg-parchment hover:text-carbon"
              >
                Search another
              </Link>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze">
                Try these instead
              </span>
            </div>
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-3" staggerDelay={0.08}>
              {suggestionsFor(name).map((alt) => (
                <StaggerItem key={alt}>
                  <Link
                    href={`/search?name=${encodeURIComponent(alt)}`}
                    className="group block rounded-xl border border-sand-core bg-cream px-4 py-4 text-center transition-all hover:border-gold hover:shadow-kid-sm"
                  >
                    <span className="block truncate font-display text-xl text-carbon">
                      {alt}
                      <span className="text-gold">.kite</span>
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <FadeIn>
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-bronze transition-colors hover:text-carbon"
        >
          <ChevronLeft className="h-3 w-3" strokeWidth={1.8} />
          Search / Register
        </Link>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h1 className="mt-6 flex items-baseline font-display text-6xl leading-none text-carbon sm:text-7xl md:text-8xl">
          <span className="truncate">{name}</span>
          <span className="ml-1 text-4xl text-gold sm:text-5xl md:text-6xl">{TLD}</span>
        </h1>
        <div className="mt-6 editorial-rule" />
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="mt-8">
          <WalletGuard message="Connect your wallet to register this name.">
            <RegisterFlow name={name} />
          </WalletGuard>
        </div>
      </FadeIn>
    </div>
  );
}
