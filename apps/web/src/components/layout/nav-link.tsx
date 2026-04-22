'use client';

import type { LucideIcon } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
  /**
   * Shared layoutId used by the motion underline to animate between active items.
   * Defaults to "nav-active" — pass a unique id per nav group if you render
   * multiple nav instances at the same time (e.g. desktop + mobile).
   */
  layoutId?: string;
  /** When true, match href exactly. Otherwise use startsWith (for section roots). */
  exact?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function NavLink({
  href,
  label,
  icon: Icon,
  external = false,
  layoutId = 'nav-active',
  exact = false,
  className,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = external
    ? false
    : exact
      ? pathname === href
      : pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
      <span>{label}</span>
      {external && <ExternalLink className="h-3 w-3 opacity-70" strokeWidth={1.5} aria-hidden />}
    </span>
  );

  const classes = cn(
    'relative inline-flex items-center font-sans text-sm font-medium transition-colors',
    isActive ? 'text-carbon' : 'text-bronze hover:text-carbon',
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onNavigate}>
      {content}
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full bg-gradient-gold"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
    </Link>
  );
}
