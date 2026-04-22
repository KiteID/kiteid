'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
}

/**
 * Uses `whileInView` (motion's built-in viewport detection) — more robust
 * than manual `useInView` + conditional animate, because motion guarantees
 * the animation fires even if hydration timing is off.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  y = 20,
  once = true,
  className,
}: RevealOnScrollProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
