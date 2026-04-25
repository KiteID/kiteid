import { createExpiryWorker, scheduleExpiryScan } from './queues/expiry-reminder';
import { createStatsWorker, scheduleStatsAggregation } from './queues/stats-aggregator';
import { createWelcomeWorker } from './queues/welcome-email';

async function main() {
  console.log('[workers] Starting KiteID workers...');

  // Create workers
  const expiryWorker = createExpiryWorker();
  const welcomeWorker = createWelcomeWorker();
  const statsWorker = createStatsWorker();

  // Schedule recurring jobs
  await scheduleExpiryScan();
  await scheduleStatsAggregation();

  console.log('[workers] All workers started. Scheduled:');
  console.log('  - expiry-scan: daily at 10:00 UTC');
  console.log('  - stats-aggregate: hourly');
  console.log('  - welcome: event-driven');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[workers] Shutting down...');
    await Promise.all([expiryWorker.close(), welcomeWorker.close(), statsWorker.close()]);
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('[workers] Fatal error:', err);
  process.exit(1);
});
