'use client';

import { useWrapName } from '@kiteid/sdk';
import { Button } from '@kiteid/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FuseLockWarning } from './fuse-lock-warning';
import { FuseSelector } from './fuse-selector';
import { WrapStatus } from './wrap-status';

interface WrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: string;
  tokenId: bigint;
  owner: string;
}

type Step = 'select' | 'preview' | 'confirm' | 'approving' | 'pending' | 'done';

export function WrapDialog({ open, onOpenChange, node, tokenId, owner }: WrapDialogProps) {
  const chainId = useChainId();
  const { address: account } = useAccount();
  const { wrapAsync, checkWrapperApprovalAsync, approveWrapperAsync } = useWrapName(chainId);
  const [step, setStep] = useState<Step>('select');
  const [selectedFuses, setSelectedFuses] = useState<bigint>(0n);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch wrap preview
  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ['wrap-preview', node, selectedFuses],
    queryFn: async () => {
      const res = await fetch('/api/v2/wrap/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node,
          owner,
          fuses: selectedFuses.toString(),
          duration: 31536000, // 1 year default
        }),
      });
      if (!res.ok) throw new Error('Failed to generate preview');
      return res.json();
    },
    enabled: step === 'preview',
  });

  const handleSelectFuses = (fuses: bigint) => {
    setSelectedFuses(fuses);
    setStep('preview');
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  const _handleSign = async () => {
    try {
      setError('');
      if (!account) throw new Error('Wallet not connected');

      // Step 1: Check if wrapper has approval to transfer the NFT
      const isApproved = await checkWrapperApprovalAsync(account);
      if (!isApproved) {
        setStep('approving');
        await approveWrapperAsync();
        // Wait briefly for approval to be mined before proceeding
      }

      // Step 2: Sign EIP-712 and submit to relayer
      setStep('pending');
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 31536000);
      const hash = await wrapAsync(node as `0x${string}`, tokenId, account, selectedFuses, expiry);
      setTxHash(hash);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('confirm');
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedFuses(0n);
    setTxHash('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Wrap Name to V2</DialogTitle>
          <DialogDescription>Lock your name with custom permissions (fuses)</DialogDescription>
        </DialogHeader>

        {step === 'select' && <FuseSelector onSelect={handleSelectFuses} />}

        {step === 'preview' && preview && (
          <div className="space-y-4">
            <FuseLockWarning fuses={selectedFuses} />
            <div className="rounded-lg bg-stone-50 dark:bg-stone-900 p-4 space-y-2">
              <p className="text-sm text-stone-600 dark:text-stone-400">Gas Estimate</p>
              <p className="text-lg font-semibold">{preview.gasEstimate.wrap} gas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConfirm} className="flex-1" disabled={previewLoading}>
                {previewLoading ? 'Loading...' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Review your wrapping settings
            </p>
            <div className="rounded-lg bg-stone-50 dark:bg-stone-900 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">Node</span>
                <code className="text-xs font-mono">{node.slice(0, 10)}...</code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">Fuses</span>
                <code className="text-xs font-mono">
                  {selectedFuses.toString(2).padStart(32, '0')}
                </code>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('preview')} className="flex-1">
                Back
              </Button>
              <Button onClick={_handleSign} className="flex-1">
                Sign with Wallet
              </Button>
            </div>
          </div>
        )}

        {step === 'approving' && (
          <div className="space-y-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-gradient-to-r from-bronze to-stone rounded-full mx-auto" />
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Approving wrapper to transfer your name NFT...
            </p>
            <p className="text-xs text-stone-500">
              One-time approval required before wrapping. Please confirm in your wallet.
            </p>
          </div>
        )}

        {step === 'pending' && (
          <div className="space-y-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-gradient-to-r from-bronze to-stone rounded-full mx-auto" />
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">Wrapping name...</p>
          </div>
        )}

        {step === 'done' && txHash && (
          <div className="space-y-4">
            <WrapStatus node={node} txHash={txHash} />
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
