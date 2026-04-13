import { ponder } from 'ponder:registry';
import { formatEther, namehash } from 'viem';
import { activityEvent, domain } from '../../ponder.schema';

ponder.on('KiteController:NameRegistered', async ({ event, context }) => {
  const { name, label, owner, baseCost, premium, expires } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  const fullNamehash = namehash(`${name}.kite`);

  await context.db
    .insert(domain)
    .values({
      name,
      namehash: fullNamehash,
      tokenId: label,
      labelhash: label,
      owner,
      registrant: owner,
      registeredAt: event.block.timestamp,
      expiresAt: expires,
      createdAtBlock: event.block.number,
    })
    .onConflictDoUpdate({
      namehash: fullNamehash,
      registrant: owner,
      owner,
      expiresAt: expires,
    });

  await context.db.insert(activityEvent).values({
    id: eventId,
    name,
    eventType: 'NameRegistered',
    actor: owner,
    toAddr: owner,
    priceKite: formatEther(baseCost + premium),
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on('KiteController:NameRenewed', async ({ event, context }) => {
  const { name, cost, expires } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;

  await context.db.update(domain, { name }).set({ expiresAt: expires });

  await context.db.insert(activityEvent).values({
    id: eventId,
    name,
    eventType: 'NameRenewed',
    actor: event.transaction.from,
    priceKite: formatEther(cost),
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});
