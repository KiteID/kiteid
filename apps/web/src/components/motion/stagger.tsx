'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
  className?: string;
  as?: 'div' | 'ul' | 'ol' | 'section';
}

/**
 * Uses `whileInView` to orchestrate children — more robust than manual
 * initial/animate pairs when nested inside `RevealOnScroll`.
 */
export function Stagger({
  children,
  delay = 0,
  staggerDelay = 0.08,
  className,
  as = 'div',
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = 'div',
  y = 12,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
  y?: number;
}) {
  const Component = motion[as];
  return (
    <Component
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
