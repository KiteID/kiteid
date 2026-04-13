import { ponder } from 'ponder:registry';
import { eq } from 'drizzle-orm';
import { zeroAddress } from 'viem';
import { activityEvent, domain } from '../../ponder.schema';

ponder.on('KiteBaseRegistrar:Transfer', async ({ event, context }) => {
  const { from, to, id } = event.args;

  // Skip mint transfers (from=0x0) — handled by Controller:NameRegistered
  if (from === zeroAddress) return;

  const tokenId = `0x${id.toString(16).padStart(64, '0')}` as `0x${string}`;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;

  const [existing] = await context.db.sql
    .select({ name: domain.name })
    .from(domain)
    .where(eq(domain.tokenId, tokenId))
    .limit(1);

  if (existing) {
    await context.db.update(domain, { name: existing.name }).set({ owner: to });

    await context.db.insert(activityEvent).values({
      id: eventId,
      name: existing.name,
      eventType: 'Transfer',
      actor: from,
      fromAddr: from,
      toAddr: to,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
    });
  }
});

ponder.on('KiteBaseRegistrar:NameRenewed', async ({ event, context }) => {
  const { id, expires } = event.args;
  const tokenId = `0x${id.toString(16).padStart(64, '0')}` as `0x${string}`;

  const [existing] = await context.db.sql
    .select({ name: domain.name })
    .from(domain)
    .where(eq(domain.tokenId, tokenId))
    .limit(1);

  if (existing) {
    await context.db.update(domain, { name: existing.name }).set({ expiresAt: expires });
  }
});
