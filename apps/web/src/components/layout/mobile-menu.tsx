'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LogoIcon } from '@/components/brand/logo-icon';
import { Wordmark } from '@/components/brand/wordmark';
import { ConnectButton } from '@/components/web3/connect-button';
import { NavLink } from './nav-link';

interface NavItem {
  href: string;
  label: string;
  external?: boolean;
}

interface MobileMenuProps {
  items: ReadonlyArray<NavItem>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ items, open, onOpenChange }: MobileMenuProps) {
  const reduce = useReducedMotion();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-50 bg-carbon/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => {
                // Avoid auto-focusing on the first nav link — prefer the close button instead.
                e.preventDefault();
                document.querySelector<HTMLButtonElement>('[data-mobile-menu-close]')?.focus();
              }}
            >
              <motion.aside
                initial={reduce ? { x: 0 } : { x: '100%' }}
                animate={{ x: 0 }}
                exit={reduce ? { x: 0 } : { x: '100%' }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-y-0 right-0 z-50 flex h-full w-80 max-w-[85vw] flex-col border-l border-sand-core bg-cream shadow-kid-xl"
              >
                <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-sand-core/60 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <LogoIcon size={24} />
                    <Wordmark size="sm" />
                  </div>
                  <DialogPrimitive.Close
                    data-mobile-menu-close
                    aria-label="Close menu"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-bronze transition-colors hover:bg-parchment hover:text-carbon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </DialogPrimitive.Close>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
                  {items.map((item) => (
                    <div
                      key={item.href}
                      className="rounded-md px-3 py-3 transition-colors hover:bg-parchment"
                    >
                      <NavLink
                        href={item.href}
                        label={item.label}
                        external={item.external}
                        layoutId="mobile-nav-active"
                        onNavigate={() => onOpenChange(false)}
                        className="w-full text-base"
                      />
                    </div>
                  ))}
                </nav>

                {/* Footer: connect */}
                <div className="border-t border-sand-core/60 p-5">
                  <ConnectButton fullWidth />
                </div>
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
