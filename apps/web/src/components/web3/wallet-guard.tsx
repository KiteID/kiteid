'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@kiteid/ui';
import type { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from './connect-button';

interface WalletGuardProps {
  children: ReactNode;
  message?: string;
}

export function WalletGuard({
  children,
  message = 'Bu sayfayı görüntülemek için cüzdanınızı bağlayın.',
}: WalletGuardProps) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Cüzdan Gerekli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-bronze">{message}</p>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
