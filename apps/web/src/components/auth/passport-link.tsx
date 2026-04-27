'use client';

import { Button } from '@kiteid/ui';
import { Loader, LogOut } from 'lucide-react';
import { useState } from 'react';

interface PassportLinkProps {
  isLinked?: boolean;
  isLoading?: boolean;
  onLink?: () => void;
  onUnlink?: () => void;
}

export function PassportLink({
  isLinked = false,
  isLoading = false,
  onLink,
  onUnlink,
}: PassportLinkProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLinked) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-success/30 bg-success/5 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-success">
            Kite Passport Linked
          </p>
          <p className="mt-1 text-sm text-graphite">
            Your wallet is connected to your Kite Passport identity.
          </p>
        </div>

        {showConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-stone">Unlink this wallet from your Kite Passport?</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onUnlink?.();
                  setShowConfirm(false);
                }}
                disabled={isLoading}
                className="min-h-[40px]"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Unlinking...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Unlink
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                className="min-h-[40px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(true)}
            className="min-h-[40px] border-sand-core"
          >
            Unlink Passport
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={onLink}
      disabled={isLoading}
      className="inline-flex min-h-[44px] items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          Connecting to Kite Passport...
        </>
      ) : (
        'Link with Kite Passport'
      )}
    </Button>
  );
}
