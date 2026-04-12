'use client';

import Link from 'next/link';
import { LogoIcon } from '../brand/logo-icon';
import { Wordmark } from '../brand/wordmark';
import { ConnectButton } from '../web3/connect-button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <Wordmark size="sm" />
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/search"
            className="text-sm font-medium text-bronze transition-colors hover:text-carbon"
          >
            Search
          </Link>
          <Link
            href="/names"
            className="text-sm font-medium text-bronze transition-colors hover:text-carbon"
          >
            My Names
          </Link>
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
}
