'use client';

import { useIndexedNames } from '@kiteid/sdk';
import { Button, Skeleton } from '@kiteid/ui';
import { ExternalLink, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatEther } from 'viem';
import { createSiweMessage } from 'viem/siwe';
import { useAccount, useBalance, useChainId, useSignMessage } from 'wagmi';
import { AnimatedCounter, FadeIn, MagneticButton } from '@/components/motion';
import { CopyAddress } from '@/components/ui/copy-address';
import { EmptyState } from '@/components/ui/empty-state';
import { IndexerBanner } from '@/components/ui/indexer-banner';
import { signOut, siwe, useSession } from '@/lib/auth-client';

function initialsFromSource(source: string): string {
  if (source.startsWith('0x')) {
    return source.slice(2, 4).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function NotConnected() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon="kite"
        title="Your identity, verified."
        description="Connect your wallet to sign in with Ethereum and manage your primary name."
        action={{ label: 'Learn more', href: '/#how-it-works' }}
      />
    </section>
  );
}

interface SignInCardProps {
  address: `0x${string}`;
  chainId: number;
}

function SignInCard({ address, chainId }: SignInCardProps) {
  const { signMessageAsync } = useSignMessage();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = useCallback(async () => {
    setSigningIn(true);
    try {
      const { data: nonceData } = await siwe.nonce({ walletAddress: address, chainId });
      if (!nonceData?.nonce) throw new Error('Failed to get nonce');

      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce: nonceData.nonce,
        uri: window.location.origin,
        version: '1',
        statement: 'Sign in to KiteID',
      });

      const signature = await signMessageAsync({ message });

      const { error } = await siwe.verify({
        message,
        signature,
        walletAddress: address,
        chainId,
      });

      if (error) throw new Error(error.message || 'Verification failed');
      toast.success('Signed in');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSigningIn(false);
    }
  }, [address, chainId, signMessageAsync]);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
      <FadeIn className="w-full">
        <div className="rounded-2xl border border-sand-core bg-cream p-8 shadow-kid-md">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-bronze">
            KITEID · AUTHENTICATE
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-carbon">
            One signature <span className="text-gradient-gold">to sign in.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-graphite">
            Sign-in with Ethereum (SIWE) binds a session to your wallet without revealing any
            personal data. Nothing leaves your device but a cryptographic signature. Your keys stay
            in your wallet — always.
          </p>
          <div className="my-6 editorial-rule" />
          <div className="flex items-center justify-between text-xs text-bronze">
            <span className="font-mono uppercase tracking-wider">Wallet</span>
            <CopyAddress value={address} />
          </div>
          <div className="mt-8">
            <MagneticButton
              onClick={handleSignIn}
              disabled={signingIn}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md transition-shadow hover:shadow-kid-lg disabled:opacity-70"
            >
              {signingIn ? 'Awaiting signature…' : 'Sign in with wallet'}
            </MagneticButton>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: session, isPending: sessionLoading } = useSession();
  const { domains, isLoading: domainsLoading, error: domainsError } = useIndexedNames();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast.success('Signed out');
  }, []);

  const primaryName = useMemo(
    () => domains.find((d) => d.isPrimaryFor)?.name ?? domains[0]?.name,
    [domains],
  );

  if (!isConnected || !address) {
    return <NotConnected />;
  }

  if (sessionLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Identity hero skeleton */}
        <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-md sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-11 w-24 rounded-lg" />
          </div>
        </div>

        {/* Stats row skeleton */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['s1', 's2', 's3'].map((k) => (
            <div
              key={k}
              className="rounded-xl border border-sand-core bg-parchment p-6 shadow-kid-sm"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-12 w-24" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!session?.user) {
    return <SignInCard address={address} chainId={chainId} />;
  }

  const displaySource = primaryName ?? address;
  const initials = initialsFromSource(displaySource);
  const _displayName = primaryName ? `${primaryName}.kite` : truncateAddress(address);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <IndexerBanner show={Boolean(domainsError)} />

      {/* Identity hero */}
      <FadeIn>
        <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-md sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-gold shadow-kid-md">
                  <span className="font-display text-4xl text-cream">{initials}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream bg-gold">
                  <User className="h-2.5 w-2.5 text-cream" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
                  {primaryName ? 'Primary name' : 'Wallet'}
                </p>
                <h1 className="mt-1 truncate font-display text-4xl text-carbon sm:text-5xl">
                  {primaryName ? (
                    <>
                      {primaryName}
                      <span className="text-gold">.kite</span>
                    </>
                  ) : (
                    <span className="font-mono text-3xl">{truncateAddress(address)}</span>
                  )}
                </h1>
                <div className="mt-2">
                  <CopyAddress value={address} truncate={false} />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="min-h-[44px] text-bronze hover:text-carbon"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats row */}
      <FadeIn delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Names owned">
            <AnimatedCounter value={domains.length} className="font-display text-5xl text-carbon" />
          </StatTile>
          <StatTile label="Primary">
            <span className="font-display text-5xl text-carbon">
              {primaryName ? 'Set' : 'None'}
            </span>
          </StatTile>
          <StatTile label="Member since">
            <AnimatedCounter
              value={new Date().getFullYear()}
              className="font-display text-5xl text-carbon"
            />
          </StatTile>
        </div>
      </FadeIn>

      {/* Primary showcase */}
      {primaryName && (
        <FadeIn delay={0.15}>
          <div className="mt-8 rounded-2xl border border-sand-core bg-cream p-8 shadow-kid-sm">
            <div className="flex items-start justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bronze">
                Primary name
              </p>
              <Link
                href={`/names/${encodeURIComponent(primaryName)}`}
                className="inline-flex min-h-[44px] items-center gap-1 text-xs text-bronze transition-colors hover:text-carbon"
              >
                Change
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
            <h2 className="mt-4 break-words font-display text-6xl leading-none text-carbon sm:text-7xl">
              {primaryName}
              <span className="gold-foil">.kite</span>
            </h2>
          </div>
        </FadeIn>
      )}

      {/* Owned names */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">Library</p>
            <h2 className="mt-1 font-display text-3xl text-carbon">
              Your names <span className="text-bronze">({domains.length})</span>
            </h2>
          </div>
          {domains.length > 6 && (
            <Link
              href="/names"
              className="inline-flex min-h-[44px] items-center gap-1 text-sm text-bronze transition-colors hover:text-carbon"
            >
              View all
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="mt-4 editorial-rule" />

        <div className="mt-6">
          {domainsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {['d1', 'd2', 'd3', 'd4'].map((k) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-4 rounded-xl border border-sand-core bg-cream px-4 py-3 shadow-kid-sm"
                >
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          ) : domains.length === 0 ? (
            <div className="rounded-xl border border-sand-core bg-cream p-4 shadow-kid-sm">
              <EmptyState
                icon="kite"
                title="No names yet."
                description="Claim your first .kite name to personalize your profile."
                action={{ label: 'Search names', href: '/' }}
                className="py-10"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {domains.slice(0, 6).map((d) => (
                <Link
                  key={d.name}
                  href={`/names/${encodeURIComponent(d.name)}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-sand-core bg-cream px-4 py-3 shadow-kid-sm transition-shadow hover:shadow-kid-md"
                >
                  <span className="truncate font-display text-xl text-carbon">
                    {d.name}
                    <span className="text-gold">.kite</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-stone">
                    {new Date(Number(d.expiresAt) * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallet footer */}
      <FadeIn delay={0.2}>
        <div className="mt-12 rounded-2xl border border-sand-core bg-sand-pale p-6 shadow-kid-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bronze">Wallet</p>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-stone">Address</dt>
              <dd className="mt-1">
                <CopyAddress value={address} truncate={false} />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-stone">
                Chain ID
              </dt>
              <dd className="mt-1 font-mono text-sm text-carbon">{chainId}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-stone">Balance</dt>
              <dd className="mt-1 font-mono text-sm text-carbon">
                {balance
                  ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </FadeIn>
    </section>
  );
}

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sand-core bg-parchment p-6 shadow-kid-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
