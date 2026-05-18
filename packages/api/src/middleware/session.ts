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
  // Normalize the allow-list to canonical origins (scheme://host[:port]). Any
  // entry that does not parse is discarded so a typo cannot accidentally widen
  // the policy. Substring/prefix matches are NOT used — see toOrigin() below.
  const trusted = new Set<string>(
    (process.env.TRUSTED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        try {
          return new URL(s).origin;
        } catch {
          return '';
        }
      })
      .filter(Boolean),
  );

  // Parse the header value back to scheme://host[:port]. URL parsing is the
  // only safe way to compare — string ops let `https://kiteid.xyz.evil.com`
  // sneak past a startsWith check on `https://kiteid.xyz`.
  const toOrigin = (value: string): string | null => {
    if (!value) return null;
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  };

  return async (c, next) => {
    const method = c.req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }

    const originHeader = c.req.header('origin') || '';
    const refererHeader = c.req.header('referer') || '';
    const origin = toOrigin(originHeader);
    const referer = toOrigin(refererHeader);

    if (trusted.size === 0) {
      // No allow-list configured — fall back to host header match so local dev
      // works out of the box. Prod must set TRUSTED_ORIGINS. The fallback only
      // compares hostnames (not bare substring) to keep parity with the
      // strict path.
      const host = c.req.header('host') || '';
      const matchesHost = (parsed: string | null) => {
        if (!parsed) return false;
        try {
          return new URL(parsed).host === host;
        } catch {
          return false;
        }
      };
      if (!matchesHost(origin) && !matchesHost(referer)) {
        return c.json({ error: 'Origin not allowed' }, 403);
      }
      return next();
    }

    if (origin && trusted.has(origin)) return next();
    if (referer && trusted.has(referer)) return next();

    return c.json({ error: 'Origin not allowed' }, 403);
  };
}
