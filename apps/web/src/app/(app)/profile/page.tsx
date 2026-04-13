'use client';

import { useIndexedNames } from '@kiteid/sdk';
import { Button, Card, CardContent, Skeleton } from '@kiteid/ui';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { createSiweMessage } from 'viem/siwe';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { signOut, siwe, useSession } from '@/lib/auth-client';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { data: session, isPending: sessionLoading } = useSession();
  const { domains, isLoading: domainsLoading } = useIndexedNames();
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    if (!address) return;
    setSigningIn(true);
    setAuthError(null);

    try {
      // 1. Get nonce from server
      const { data: nonceData } = await siwe.nonce({
        walletAddress: address,
        chainId,
      });
      if (!nonceData?.nonce) throw new Error('Failed to get nonce');

      // 2. Create SIWE message
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce: nonceData.nonce,
        uri: window.location.origin,
        version: '1',
        statement: 'Sign in to KiteID',
      });

      // 3. Sign with wallet
      const signature = await signMessageAsync({ message });

      // 4. Verify on server → creates session
      const { error } = await siwe.verify({
        message,
        signature,
        walletAddress: address,
        chainId,
      });

      if (error) throw new Error(error.message || 'Verification failed');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSigningIn(false);
    }
  }, [address, chainId, signMessageAsync]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-carbon">Profile</h1>
        <p className="mt-3 text-bronze">Connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-carbon">Profile</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <span className="text-2xl font-bold text-gold">
                {address ? address.slice(2, 4).toUpperCase() : '??'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-carbon">
                {address ? truncateAddress(address) : 'Not connected'}
              </h2>
              {sessionLoading ? (
                <Skeleton className="mt-1 h-4 w-32" />
              ) : session?.user ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-bronze">Signed in</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-xs text-bronze/60 underline hover:text-bronze"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <Button
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="bg-gold text-cream hover:bg-bronze"
                  >
                    {signingIn ? 'Signing in...' : 'Sign in with Wallet'}
                  </Button>
                  {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-carbon">My Domains</h2>
        {domainsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : domains.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-bronze">No domains registered yet.</p>
              <Link href="/search" className="mt-4 inline-block">
                <Button className="bg-gold text-cream hover:bg-bronze">Register a Domain</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {domains.map((d) => (
              <Link key={d.name} href={`/names/${encodeURIComponent(d.name)}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-semibold text-carbon">
                      {d.name}
                      <span className="text-gold">.kite</span>
                    </span>
                    <span className="text-xs text-bronze">
                      Expires: {new Date(Number(d.expiresAt) * 1000).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
