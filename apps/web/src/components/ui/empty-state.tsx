'use client';

import { Button } from '@kiteid/ui';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { isValidElement } from 'react';
import { FadeIn, MagneticButton } from '@/components/motion';
import { cn } from '@/lib/cn';

type LucideLike = ComponentType<{ className?: string; strokeWidth?: number }>;

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon?: ReactNode | LucideLike | 'kite';
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

function KiteRhombus() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-6 w-6 rotate-45 text-gold"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Kite mark</title>
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

function renderIcon(icon: EmptyStateProps['icon']): ReactNode {
  if (icon === undefined || icon === null) return null;
  if (icon === 'kite') return <KiteRhombus />;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function') {
    const IconComp = icon as LucideLike;
    return <IconComp className="h-6 w-6 text-bronze" strokeWidth={1.5} />;
  }
  return icon as ReactNode;
}

function ActionButton({ action }: { action: EmptyStateAction }) {
  const variant = action.variant ?? 'primary';

  if (variant === 'primary') {
    const className =
      'inline-flex h-12 items-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md transition-shadow hover:shadow-kid-lg';
    if (action.href) {
      return (
        <Link href={action.href}>
          <MagneticButton className={className}>{action.label}</MagneticButton>
        </Link>
      );
    }
    return (
      <MagneticButton onClick={action.onClick} className={className}>
        {action.label}
      </MagneticButton>
    );
  }

  if (action.href) {
    return (
      <Link href={action.href}>
        <Button variant="outline" className="min-h-[44px] border-sand-core">
          {action.label}
        </Button>
      </Link>
    );
  }
  return (
    <Button onClick={action.onClick} variant="outline" className="min-h-[44px] border-sand-core">
      {action.label}
    </Button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const iconNode = renderIcon(icon);

  return (
    <div
      className={cn(
        'mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:py-20',
        className,
      )}
    >
      {iconNode && (
        <FadeIn>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-sand-core bg-parchment shadow-kid-sm">
            {iconNode}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.08}>
        <h2 className="font-display text-3xl leading-tight text-carbon">{title}</h2>
      </FadeIn>

      {description && (
        <FadeIn delay={0.16}>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-graphite">
            {description}
          </p>
        </FadeIn>
      )}

      {(action || secondaryAction) && (
        <FadeIn delay={0.24}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            {action && <ActionButton action={action} />}
            {secondaryAction && <ActionButton action={secondaryAction} />}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
