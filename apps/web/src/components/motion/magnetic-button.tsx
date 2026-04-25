'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useRef, useState } from 'react';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  strength?: number;
}

/**
 * Subtle magnetic hover — cursor pulls the button slightly. Editorial feel.
 * Disabled on reduced motion and touch devices.
 */
export function MagneticButton({
  children,
  strength = 0.25,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduce) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={pos}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.5 }}
      className={className}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
