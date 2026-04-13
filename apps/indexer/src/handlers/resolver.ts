import { ponder } from 'ponder:registry';
import { eq } from 'drizzle-orm';
import { activityEvent, domain, resolverRecord } from '../../ponder.schema';

// Helper: find domain name by namehash (node) using raw Drizzle select
async function findDomainByNode(
  // biome-ignore lint/suspicious/noExplicitAny: Ponder context.db typing is opaque
  db: any,
  node: `0x${string}`,
): Promise<string | null> {
  const results = await db.sql
    .select({ name: domain.name })
    .from(domain)
    .where(eq(domain.namehash, node))
    .limit(1);
  return results[0]?.name ?? null;
}

ponder.on('KiteResolver:AddrChanged', async ({ event, context }) => {
  const { node, a } = event.args;
  const domainName = await findDomainByNode(context.db, node);
  if (!domainName) return;

  const recordId = `${domainName}:addr:default`;

  await context.db
    .insert(resolverRecord)
    .values({
      id: recordId,
      name: domainName,
      recordType: 'addr',
      key: 'default',
      value: a,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      value: a,
      updatedAt: event.block.timestamp,
    });

  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  await context.db.insert(activityEvent).values({
    id: eventId,
    name: domainName,
    eventType: 'AddrChanged',
    actor: event.transaction.from,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on('KiteResolver:TextChanged', async ({ event, context }) => {
  const { node, key, value } = event.args;
  const domainName = await findDomainByNode(context.db, node);
  if (!domainName) return;

  const recordId = `${domainName}:text:${key}`;

  await context.db
    .insert(resolverRecord)
    .values({
      id: recordId,
      name: domainName,
      recordType: 'text',
      key,
      value,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      value,
      updatedAt: event.block.timestamp,
    });

  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  await context.db.insert(activityEvent).values({
    id: eventId,
    name: domainName,
    eventType: 'TextChanged',
    actor: event.transaction.from,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on('KiteResolver:ContenthashChanged', async ({ event, context }) => {
  const { node, hash } = event.args;
  const domainName = await findDomainByNode(context.db, node);
  if (!domainName) return;

  const recordId = `${domainName}:contenthash:default`;

  await context.db
    .insert(resolverRecord)
    .values({
      id: recordId,
      name: domainName,
      recordType: 'contenthash',
      key: 'default',
      value: hash,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      value: hash,
      updatedAt: event.block.timestamp,
    });

  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  await context.db.insert(activityEvent).values({
    id: eventId,
    name: domainName,
    eventType: 'ContenthashChanged',
    actor: event.transaction.from,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});
