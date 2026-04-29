'use client';

import { Button } from '@kiteid/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
  owner: string;
}

type Step = 'select' | 'preview' | 'confirm' | 'pending' | 'done';

export function WrapDialog({ open, onOpenChange, node, owner }: WrapDialogProps) {
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

  const handleSign = async () => {
    try {
      setStep('pending');
      setError('');
      // TODO: Call wagmi to sign wrap transaction
      // For MVP, just show pending state
      setTxHash('0x...');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('preview');
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
          <div className="flex items-center justify-between">
            <DialogTitle>Wrap Name to V2</DialogTitle>
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
              Demo Preview
            </span>
          </div>
          <DialogDescription>
            This is a preview interface. Contract integration coming in Phase 6b
          </DialogDescription>
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
              <Button onClick={handleSign} className="flex-1">
                Sign & Wrap
              </Button>
            </div>
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
