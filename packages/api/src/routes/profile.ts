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

    // Length caps on free-text fields to prevent resource-exhaustion writes.
    if (body.primaryName !== undefined) {
      if (typeof body.primaryName !== 'string' || body.primaryName.length > 253) {
        return c.json({ error: 'primaryName too long' }, 400);
      }
      updateData.primaryName = body.primaryName;
    }
    if (body.bio !== undefined) {
      if (typeof body.bio !== 'string' || body.bio.length > 500) {
        return c.json({ error: 'bio too long (max 500 chars)' }, 400);
      }
      updateData.bio = body.bio;
    }
    if (body.image !== undefined) {
      if (typeof body.image !== 'string' || body.image.length > 2048) {
        return c.json({ error: 'image url too long (max 2048 chars)' }, 400);
      }
      updateData.image = body.image;
    }
    if (body.notificationPrefs !== undefined) {
      // Whitelist the three known boolean flags; reject everything else so a
      // malicious client cannot stuff arbitrary JSON (large blobs, nested
      // objects, prototype-pollution keys) into the column.
      const prefs = body.notificationPrefs;
      if (prefs === null || typeof prefs !== 'object' || Array.isArray(prefs)) {
        return c.json({ error: 'notificationPrefs must be an object' }, 400);
      }
      const ALLOWED_KEYS = ['expiryReminder', 'renewalConfirm', 'transferAlert'] as const;
      const sanitized: Record<string, boolean> = {};
      for (const key of ALLOWED_KEYS) {
        const value = (prefs as Record<string, unknown>)[key];
        if (value === undefined) continue;
        if (typeof value !== 'boolean') {
          return c.json({ error: `notificationPrefs.${key} must be a boolean` }, 400);
        }
        sanitized[key] = value;
      }
      const extra = Object.keys(prefs).find(
        (k) => !ALLOWED_KEYS.includes(k as (typeof ALLOWED_KEYS)[number]),
      );
      if (extra) {
        return c.json({ error: `notificationPrefs: unknown key '${extra}'` }, 400);
      }
      updateData.notificationPrefs = sanitized;
    }

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
