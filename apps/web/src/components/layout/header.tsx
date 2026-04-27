'use client';

import { Menu } from 'lucide-react';
import { LayoutGroup } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { LogoIcon } from '../brand/logo-icon';
import { Wordmark } from '../brand/wordmark';
import { ConnectButton } from '../web3/connect-button';
import { MobileMenu } from './mobile-menu';
import { NavLink } from './nav-link';
import { ThemeToggle } from './theme-toggle';

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  external?: boolean;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: '/', label: 'Search', exact: true },
  { href: '/names', label: 'My Names' },
  { href: '/activity', label: 'Activity' },
  { href: 'https://docs.kiteid.xyz', label: 'Docs', external: true },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sand-core/50 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-[4.5rem]">
          {/* Left: logo */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label="KiteID home"
          >
            <LogoIcon size={28} />
            <Wordmark size="sm" />
          </Link>

          {/* Center: desktop nav */}
          <LayoutGroup id="desktop-nav">
            <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  external={item.external}
                  exact={item.exact}
                  layoutId="desktop-nav-active"
                />
              ))}
            </nav>
          </LayoutGroup>

          {/* Right: connect + theme toggle + hamburger */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden md:block">
              <ConnectButton />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-bronze transition-colors hover:bg-parchment hover:text-carbon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:text-gold dark:hover:bg-carbon-soft dark:hover:text-gold md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu items={NAV_ITEMS} open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
