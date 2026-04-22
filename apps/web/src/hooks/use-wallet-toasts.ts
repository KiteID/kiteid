'use client';

import { kiteAI, kiteAITestnet } from '@kiteid/sdk';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';

/**
 * Emits toasts for wallet-level events. Runs once per app via <WalletToastBridge>.
 *
 * Rules:
 * - Connect toast only fires on *new* session (not page reload). We compare
 *   the address-present transition while skipping the very first mount read,
 *   which is either "already connected from storage" (silent) or "disconnected".
 * - Disconnect toast fires only after we saw a connected state.
 * - Chain switch toast fires on chainId change while connected.
 */
export function useWalletToasts() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Track previous values to detect transitions. We intentionally use a
  // "mounted" flag so the initial hydration doesn't fire a toast.
  const mountedRef = useRef(false);
  const lastAddressRef = useRef<string | undefined>(address);
  const lastChainIdRef = useRef<number | undefined>(chainId);
  const hadConnectionRef = useRef<boolean>(isConnected);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      lastAddressRef.current = address;
      lastChainIdRef.current = chainId;
      hadConnectionRef.current = isConnected;
      return;
    }

    // Connect — address transitioned from empty to set.
    if (!lastAddressRef.current && address) {
      toast.success('Connected', { id: 'wallet-connect' });
    }

    // Disconnect — address transitioned from set to empty.
    if (lastAddressRef.current && !address && hadConnectionRef.current) {
      toast.info('Wallet disconnected', { id: 'wallet-disconnect' });
    }

    // Chain switch — only announce when still connected.
    if (isConnected && lastChainIdRef.current !== undefined && chainId !== lastChainIdRef.current) {
      let label = `Chain ${chainId}`;
      if (chainId === kiteAI.id) label = kiteAI.name;
      else if (chainId === kiteAITestnet.id) label = 'Kite Testnet';
      toast.success(`Switched to ${label}`, { id: 'wallet-chain' });
    }

    lastAddressRef.current = address;
    lastChainIdRef.current = chainId;
    if (isConnected) hadConnectionRef.current = true;
  }, [address, chainId, isConnected]);
}
