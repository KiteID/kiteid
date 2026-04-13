import { db } from '@kiteid/db';
import { notifications } from '@kiteid/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { requireAuth } from '../middleware/session';
import type { AppEnv } from '../types';

export const notificationsRouter = new Hono<AppEnv>()
  .use('*', requireAuth())
  .get('/', async (c) => {
    const user = c.get('user');
    const unreadOnly = c.req.query('unread') === 'true';

    const items = await db
      .select()
      .from(notifications)
      .where(
        unreadOnly
          ? and(eq(notifications.userId, user.id), isNull(notifications.readAt))
          : eq(notifications.userId, user.id),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return c.json({ notifications: items, count: items.length });
  })
  .post('/:id/read', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const [updated] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)))
      .returning();

    if (!updated) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    return c.json({ notification: updated });
  })
  .post('/read-all', async (c) => {
    const user = c.get('user');

    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

    return c.json({ success: true });
  });
