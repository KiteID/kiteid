'use client';

import {
  formatKitePriceWithSymbol,
  useKiteRenew,
  useKiteRentPrice,
  yearsToSeconds,
} from '@kiteid/sdk';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Skeleton } from '@kiteid/ui';
import { useCallback, useState } from 'react';
import { useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { DurationPicker } from './duration-picker';

interface RenewDialogProps {
  name: string;
  open: boolean;
  onClose: () => void;
}

export function RenewDialog({ name, open, onClose }: RenewDialogProps) {
  const chainId = useChainId();
  const [years, setYears] = useState(1);
  const duration = yearsToSeconds(years);

  const price = useKiteRentPrice(name, duration, chainId);
  const { renewAsync, isPending, data: renewTxHash } = useKiteRenew(chainId);

  const receipt = useWaitForTransactionReceipt({
    hash: renewTxHash,
  });

  const totalPrice = price.data ? price.data.base + price.data.premium : undefined;

  const handleRenew = useCallback(async () => {
    if (!totalPrice) return;
    try {
      await renewAsync(name, duration, totalPrice);
    } catch {
      // Transaction rejected or failed — user sees wallet error
    }
  }, [name, duration, totalPrice, renewAsync]);

  if (!open) return null;

  const isSuccess = receipt.isSuccess;
  const isConfirming = renewTxHash && !receipt.isSuccess && !receipt.isError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-carbon/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-carbon">
            Renew {name}
            <span className="text-gold">.kite</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {isSuccess ? (
            <div className="space-y-3 text-center">
              <p className="text-lg font-semibold text-carbon">Renewal successful!</p>
              <p className="text-sm text-bronze">
                Your domain has been renewed for {years} {years === 1 ? 'year' : 'years'}.
              </p>
            </div>
          ) : (
            <>
              <DurationPicker value={years} onChange={setYears} />

              <div className="space-y-2 rounded-lg border border-border bg-cream p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bronze">Renewal cost</span>
                  {price.isLoading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : totalPrice !== undefined ? (
                    <span className="font-semibold text-carbon">
                      {formatKitePriceWithSymbol(totalPrice)}
                    </span>
                  ) : (
                    <span className="text-bronze">--</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bronze">Duration</span>
                  <span className="text-carbon">
                    {years} {years === 1 ? 'year' : 'years'}
                  </span>
                </div>
              </div>

              {isConfirming && (
                <p className="text-center text-sm text-bronze">
                  Waiting for transaction confirmation...
                </p>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="justify-end gap-3">
          {isSuccess ? (
            <Button onClick={onClose} className="bg-gold text-cream hover:bg-bronze">
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleRenew}
                disabled={isPending || price.isLoading || !totalPrice || !!isConfirming}
                className="bg-gold text-cream hover:bg-bronze"
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Renew'}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
