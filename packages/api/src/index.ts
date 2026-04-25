import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { auth } from './auth';
import { rateLimit } from './middleware/rate-limit';
import { namesRouter } from './routes/names';
import { notificationsRouter } from './routes/notifications';
import { profileRouter } from './routes/profile';

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

// Better Auth handler — handles /api/auth/*
// Cover all methods (GET/POST/OPTIONS preflight) + single /auth leaf too.
app.all('/auth', (c) => auth.handler(c.req.raw));
app.all('/auth/*', (c) => auth.handler(c.req.raw));

// Health
app.get('/health', (c) => c.json({ status: 'ok', service: 'kiteid-api', timestamp: Date.now() }));

// Diagnostic: reports indexer reachability details
app.get('/diagnose', async (c) => {
  const ponderUrl = process.env.PONDER_URL || 'http://localhost:42069';
  const started = Date.now();
  const report: Record<string, unknown> = {
    ponderUrl,
    timestamp: started,
  };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${ponderUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    report.ok = res.ok;
    report.status = res.status;
    report.elapsedMs = Date.now() - started;
    try {
      report.body = await res.text();
    } catch {
      report.body = '<non-text>';
    }
  } catch (err) {
    report.ok = false;
    report.elapsedMs = Date.now() - started;
    if (err instanceof Error) {
      report.errorName = err.name;
      report.errorMessage = err.message;
      // Node fetch usually wraps DNS/connection errors in .cause
      const cause = (err as Error & { cause?: unknown }).cause;
      if (cause && typeof cause === 'object') {
        report.cause = {
          code: (cause as { code?: string }).code,
          syscall: (cause as { syscall?: string }).syscall,
          hostname: (cause as { hostname?: string }).hostname,
          message: (cause as { message?: string }).message,
        };
      }
    } else {
      report.errorMessage = String(err);
    }
  }
  // Always return 200 for diagnostics — CF Tunnel rewrites 5xx bodies with its own page.
  // Caller must check `ok` field in JSON.
  return c.json(report, 200);
});

// Routes
app.route('/names', namesRouter);
app.route('/profile', profileRouter);
app.route('/notifications', notificationsRouter);

export default app;
export type AppType = typeof app;
