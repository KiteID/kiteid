import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { auth } from './auth';
import { rateLimit } from './middleware/rate-limit';
import { requireSameOrigin } from './middleware/session';
import { namesRouter } from './routes/names';
import { notificationsRouter } from './routes/notifications';
import { profileRouter } from './routes/profile';
import { wrapperRouter } from './routes/wrapper';

const app = new Hono().basePath('/api');

// Global middleware
app.use('*', logger());
const corsOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:3000,https://kiteid.xyz,https://www.kiteid.xyz,https://staging.kiteid.xyz'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  '*',
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

// Global rate limit: 600 requests / 15 min (enough for active polling).
// Exempt /health + /diagnose so monitoring never trips it.
app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path === '/api/health' || path === '/api/diagnose') return next();
  return rateLimit({ windowMs: 15 * 60 * 1000, max: 600, keyPrefix: 'global' })(c, next);
});

// Auth rate limit: 30 requests / 1 min
app.use('/auth/*', rateLimit({ windowMs: 60 * 1000, max: 30, keyPrefix: 'auth' }));

// CSRF / same-origin guard for state-changing custom endpoints.
// Better Auth's own /auth/* routes are excluded — it has its own CSRF logic.
app.use('/v2/*', requireSameOrigin());
app.use('/profile/*', requireSameOrigin());
app.use('/notifications/*', requireSameOrigin());

// Better Auth handler — handles /api/auth/*
// Cover all methods (GET/POST/OPTIONS preflight) + single /auth leaf too.
app.all('/auth', (c) => auth.handler(c.req.raw));
app.all('/auth/*', (c) => auth.handler(c.req.raw));

// Health
app.get('/health', (c) => c.json({ status: 'ok', service: 'kiteid-api', timestamp: Date.now() }));

// Diagnostic: reports indexer reachability details
// Public response is a minimal { ok } summary; internal hostnames/topology are only
// exposed when the request carries a matching DIAGNOSE_TOKEN header (defense against
// public infra fingerprinting flagged by HIGH-04 security review).
app.get('/diagnose', async (c) => {
  const ponderUrl = process.env.PONDER_URL || 'http://localhost:42069';
  const diagnoseToken = process.env.DIAGNOSE_TOKEN;
  const authorized =
    !!diagnoseToken &&
    (c.req.header('x-diagnose-token') === diagnoseToken ||
      c.req.header('authorization') === `Bearer ${diagnoseToken}`);
  const started = Date.now();
  const internal: Record<string, unknown> = {
    ponderUrl,
    timestamp: started,
  };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${ponderUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    internal.ok = res.ok;
    internal.status = res.status;
    internal.elapsedMs = Date.now() - started;
    try {
      internal.body = await res.text();
    } catch {
      internal.body = '<non-text>';
    }
  } catch (err) {
    internal.ok = false;
    internal.elapsedMs = Date.now() - started;
    if (err instanceof Error) {
      internal.errorName = err.name;
      internal.errorMessage = err.message;
      const cause = (err as Error & { cause?: unknown }).cause;
      if (cause && typeof cause === 'object') {
        internal.cause = {
          code: (cause as { code?: string }).code,
          syscall: (cause as { syscall?: string }).syscall,
          hostname: (cause as { hostname?: string }).hostname,
          message: (cause as { message?: string }).message,
        };
      }
    } else {
      internal.errorMessage = String(err);
    }
  }
  // Always return 200 for diagnostics — CF Tunnel rewrites 5xx bodies with its own page.
  if (authorized) return c.json(internal, 200);
  // Public response: only the boolean health summary, no infra detail.
  return c.json({ ok: internal.ok === true, timestamp: started }, 200);
});

// Routes
app.route('/names', namesRouter);
app.route('/profile', profileRouter);
app.route('/notifications', notificationsRouter);
app.route('/v2/wrap', wrapperRouter);

export default app;
export type AppType = typeof app;
