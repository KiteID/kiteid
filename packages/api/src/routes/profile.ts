import { db } from '@kiteid/db';
import { users, walletAddresses } from '@kiteid/db/schema';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getAddress } from 'viem';
import { requireAuth } from '../middleware/session';
import type { AppEnv } from '../types';

export const profileRouter = new Hono<AppEnv>()
  .get('/:address', async (c) => {
    // Normalize to checksum-case (SIWE plugin stores addresses as checksum)
    let checksumAddress: string;
    try {
      checksumAddress = getAddress(c.req.param('address'));
    } catch {
      return c.json({ error: 'Invalid address' }, 400);
    }

    const [result] = await db
      .select({
        address: walletAddresses.address,
        primaryName: users.primaryName,
        image: users.image,
        bio: users.bio,
        createdAt: users.createdAt,
      })
      .from(walletAddresses)
      .innerJoin(users, eq(users.id, walletAddresses.userId))
      .where(eq(walletAddresses.address, checksumAddress))
      .limit(1);

    if (!result) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile: result });
  })
  .patch('/', requireAuth(), async (c) => {
    const user = c.get('user');
    const body = await c.req.json<{
      primaryName?: string;
      bio?: string;
      image?: string;
      notificationPrefs?: {
        expiryReminder?: boolean;
        renewalConfirm?: boolean;
        transferAlert?: boolean;
      };
    }>();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.primaryName !== undefined) updateData.primaryName = body.primaryName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.notificationPrefs !== undefined) updateData.notificationPrefs = body.notificationPrefs;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        primaryName: users.primaryName,
        bio: users.bio,
        image: users.image,
        notificationPrefs: users.notificationPrefs,
      });

    return c.json({ profile: updated });
  });
