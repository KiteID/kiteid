import type { MiddlewareHandler } from 'hono';
import { auth } from '../auth';
import type { AppEnv } from '../types';

export function requireAuth(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', session.user as AppEnv['Variables']['user']);
    c.set('session', session.session);
    await next();
  };
}
