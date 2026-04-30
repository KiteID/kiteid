import { ponder } from 'ponder:registry';
import { eq } from 'drizzle-orm';
import { activityEvent, agentAuth, wrappedName } from '../../ponder.schema';

ponder.on('KiteWrapper:NameWrapped', async ({ event, context }) => {
  const { node, owner, fuses, expiry } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;

  await context.db.insert(wrappedName).values({
    node,
    owner,
    fuses,
    expiry,
    txHash: event.transaction.hash,
  });

  await context.db.insert(activityEvent).values({
    id: eventId,
    eventType: 'NameWrapped',
    actor: owner,
    toAddr: owner,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on('KiteWrapper:NameUnwrapped', async ({ event, context }) => {
  const { node, owner } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;

  const wrapped = await context.db.sql
    .select({ node: wrappedName.node })
    .from(wrappedName)
    .where(eq(wrappedName.node, node))
    .limit(1);

  if (wrapped.length > 0) {
    await context.db.update(wrappedName, { node }).set({
      fuses: 0n,
      expiry: 0n,
    });
  }

  await context.db.insert(activityEvent).values({
    id: eventId,
    eventType: 'NameUnwrapped',
    actor: owner,
    fromAddr: owner,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on('KiteWrapper:FusesBurned', async ({ event, context }) => {
  const { node, fuses } = event.args;

  const wrapped = await context.db.sql
    .select({ fuses: wrappedName.fuses })
    .from(wrappedName)
    .where(eq(wrappedName.node, node))
    .limit(1);

  const [existingWrapped] = wrapped;
  if (existingWrapped) {
    await context.db.update(wrappedName, { node }).set({
      fuses: (existingWrapped.fuses ?? 0n) | fuses,
    });
  }
});

ponder.on('KiteWrapper:AgentAuthorized', async ({ event, context }) => {
  const { parentNode, agentNode, agentAddress, spendCapPerTx, expiry } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  const id = `${parentNode}:${agentNode}`;

  await context.db.insert(agentAuth).values({
    id,
    parentNode,
    agentNode,
    agentAddress,
    spendCapPerTx,
    expiry,
    active: true,
    txHash: event.transaction.hash,
  });

  await context.db.insert(activityEvent).values({
    id: eventId,
    eventType: 'AgentAuthorized',
    actor: agentAddress,
    toAddr: agentAddress,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});

ponder.on('KiteWrapper:AgentRevoked', async ({ event, context }) => {
  const { parentNode, agentNode, agentAddress } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  const id = `${parentNode}:${agentNode}`;

  const auth = await context.db.sql
    .select({ id: agentAuth.id })
    .from(agentAuth)
    .where(eq(agentAuth.id, id))
    .limit(1);

  if (auth.length > 0) {
    await context.db.update(agentAuth, { id }).set({
      active: false,
    });
  }

  await context.db.insert(activityEvent).values({
    id: eventId,
    eventType: 'AgentRevoked',
    actor: agentAddress,
    fromAddr: agentAddress,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});
