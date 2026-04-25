import type { Context, MiddlewareHandler } from 'hono';

// In-memory rate limiter (no Redis dependency for now)
// Upgrade to Dragonfly sliding window in Phase 4
const store = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, val] of store) {
      if (val.resetAt < now) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}): MiddlewareHandler {
  const { windowMs, max, keyPrefix = 'rl' } = opts;

  return async (c: Context, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', String(max - 1));
      await next();
      return;
    }

    entry.count++;

    if (entry.count > max) {
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return c.json({ error: 'Too many requests' }, 429);
    }

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(max - entry.count));
    await next();
  };
}
