import { db } from '@kiteid/db';
import { Queue, Worker } from 'bullmq';
import { sql } from 'drizzle-orm';
import { connection } from '../redis';

export const statsQueue = new Queue('kiteid:stats', { connection });

export function createStatsWorker() {
  return new Worker(
    'kiteid:stats',
    async () => {
      const now = Math.floor(Date.now() / 1000);

      // Aggregate stats from ponder_index schema
      const result = await db.execute(
        sql`SELECT
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE expires_at >= ${now}) as active,
              COUNT(*) FILTER (WHERE expires_at < ${now}) as expired
            FROM ponder_index.domain`,
      );

      const row = result.rows[0] as Record<string, unknown> | undefined;

      // Log stats (Phase 4: store in timeseries table or send to observability)
      console.log('[stats]', {
        timestamp: new Date().toISOString(),
        total: row?.total,
        active: row?.active,
        expired: row?.expired,
      });
    },
    { connection },
  );
}

// Schedule hourly
export async function scheduleStatsAggregation() {
  await statsQueue.upsertJobScheduler(
    'hourly-stats',
    { pattern: '0 * * * *' },
    { name: 'stats-aggregate' },
  );
}
