'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Scrolls window to top on pathname change. Pairs well with
 * Next.js App Router where the scroll position is otherwise preserved
 * only across real navigations and not always reset between pages.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Read pathname so the effect re-runs on route change.
    void pathname;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}
