import type { MiddlewareHandler } from 'hono';
import { auth } from '../auth';
import type { AppEnv } from '../types';

export function requireAuth(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
    try {
      session = await auth.api.getSession({ headers: c.req.raw.headers });
    } catch {
      // Treat any auth lookup error (DB unreachable, malformed cookie, etc.)
      // as unauthenticated. Returning 500 here would leak whether the auth
      // backend is up and surfaces as page crashes during E2E.
      session = null;
    }

    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', session.user as AppEnv['Variables']['user']);
    c.set('session', session.session);
    await next();
  };
}

/**
 * Reject state-changing requests whose Origin/Referer does not match a trusted
 * origin. Cookie-only auth otherwise leaves custom POST/PATCH/DELETE handlers
 * open to CSRF (Better Auth's own /auth/* routes handle this internally, but
 * /v2/wrap/relay, /notifications/:id/read, /profile etc. do not).
 *
 * Safe methods (GET/HEAD/OPTIONS) are passed through.
 */
export function requireSameOrigin(): MiddlewareHandler<AppEnv> {
  const trusted = (process.env.TRUSTED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return async (c, next) => {
    const method = c.req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }

    const origin = c.req.header('origin') || '';
    const referer = c.req.header('referer') || '';

    if (trusted.length === 0) {
      // No allow-list configured — fall back to host header match so local dev
      // works out of the box. Prod must set TRUSTED_ORIGINS.
      const host = c.req.header('host') || '';
      if (origin && !origin.includes(host) && !referer.includes(host)) {
        return c.json({ error: 'Origin not allowed' }, 403);
      }
      return next();
    }

    const matches = (value: string) => trusted.some((o) => value.startsWith(o));
    if (origin && matches(origin)) return next();
    if (referer && matches(referer)) return next();

    return c.json({ error: 'Origin not allowed' }, 403);
  };
}
