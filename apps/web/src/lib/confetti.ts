'use client';

import confetti from 'canvas-confetti';

/**
 * Bronze / gold / cream confetti — Parchment Identity palette only.
 * No rainbow, no neon.
 */
export function celebrationConfetti() {
  const colors = ['#C9986A', '#A87C52', '#E8B987', '#FAF7F0', '#9B8564'];

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      colors,
      origin: { y: 0.6 },
      particleCount: Math.floor(200 * particleRatio),
      ...opts,
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

export function pulseConfetti(x = 0.5, y = 0.5) {
  confetti({
    colors: ['#C9986A', '#E8B987', '#FAF7F0'],
    origin: { x, y },
    particleCount: 40,
    spread: 50,
    startVelocity: 30,
    scalar: 0.7,
    ticks: 100,
  });
}
