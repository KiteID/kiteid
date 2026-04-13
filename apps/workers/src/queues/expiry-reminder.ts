import { randomUUID } from 'node:crypto';
import { db } from '@kiteid/db';
import { notifications, users, walletAddresses } from '@kiteid/db/schema';
import { Queue, Worker } from 'bullmq';
import { eq, sql } from 'drizzle-orm';
import { getAddress } from 'viem';
import { sendEmail } from '../email';
import { connection } from '../redis';

export const expiryQueue = new Queue('kiteid:expiry-scan', { connection });

const REMINDER_DAYS = [30, 14, 7, 1];

// SIWE plugin generates placeholder emails like "0x...@wallet.kiteid.xyz"
// Only send to user-provided real emails
const PLACEHOLDER_DOMAINS = ['@wallet.kiteid.xyz', '@localhost'];

function isPlaceholderEmail(email: string): boolean {
  return PLACEHOLDER_DOMAINS.some((d) => email.endsWith(d));
}

export function createExpiryWorker() {
  return new Worker(
    'kiteid:expiry-scan',
    async () => {
      const now = Math.floor(Date.now() / 1000);

      for (const days of REMINDER_DAYS) {
        const targetTimestamp = now + days * 86400;
        const windowStart = targetTimestamp - 43200; // -12h
        const windowEnd = targetTimestamp + 43200; // +12h

        // Query Ponder's ponder_index.domain for expiring domains
        const expiring = await db.execute(
          sql`SELECT d.name, d.owner, d.expires_at
              FROM ponder_index.domain d
              WHERE d.expires_at >= ${windowStart}
                AND d.expires_at <= ${windowEnd}`,
        );

        for (const row of expiring.rows) {
          const rawOwner = (row as Record<string, unknown>).owner as string;
          const name = (row as Record<string, unknown>).name as string;

          // Normalize to checksum-case (SIWE plugin stores addresses as checksum)
          let checksumOwner: string;
          try {
            checksumOwner = getAddress(rawOwner);
          } catch {
            continue;
          }

          // Find user via walletAddress table
          const [result] = await db
            .select({
              id: users.id,
              email: users.email,
              notificationPrefs: users.notificationPrefs,
            })
            .from(walletAddresses)
            .innerJoin(users, eq(users.id, walletAddresses.userId))
            .where(eq(walletAddresses.address, checksumOwner))
            .limit(1);

          if (!result) continue;
          if (!result.notificationPrefs?.expiryReminder) continue;

          // Create in-app notification
          await db.insert(notifications).values({
            id: randomUUID(),
            userId: result.id,
            type: 'expiry-reminder',
            payload: {
              name,
              daysLeft: days,
              expiresAt: Number((row as Record<string, unknown>).expires_at),
            },
          });

          // Send email only if user has a real address (not SIWE placeholder)
          if (result.email && !isPlaceholderEmail(result.email)) {
            await sendEmail({
              to: result.email,
              subject: `${name}.kite expires in ${days} day${days > 1 ? 's' : ''}`,
              html: `<p>Your domain <strong>${name}.kite</strong> expires in ${days} day${days > 1 ? 's' : ''}.</p>
                     <p><a href="https://kiteid.xyz/names/${name}?renew=true">Renew now</a></p>`,
            });
          }
        }
      }
    },
    { connection },
  );
}

// Schedule daily at 10:00 UTC
export async function scheduleExpiryScan() {
  await expiryQueue.upsertJobScheduler(
    'daily-expiry-scan',
    { pattern: '0 10 * * *' },
    { name: 'expiry-scan' },
  );
}
