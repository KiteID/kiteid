import { ponder } from 'ponder:registry';
import { eq } from 'drizzle-orm';
import { activityEvent, agentAuth, wrappedName } from '../../ponder.schema';

ponder.on('KiteWrapper:NameWrapped', async ({ event, context }) => {
  const { node, owner, fuses, expiry } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;

  await context.db
    .insert(wrappedName)
    .values({
      node,
      owner,
      fuses,
      expiry,
      txHash: event.transaction.hash,
    })
    .onConflictDoUpdate((_existing) => ({
      owner: owner,
      fuses: fuses,
      expiry: expiry,
      txHash: event.transaction.hash,
    }));

  await context.db.insert(activityEvent).values({
    id: eventId,
    name: '',
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

  await context.db
    .insert(wrappedName)
    .values({
      node,
      owner,
      fuses: 0n,
      expiry: 0n,
      txHash: event.transaction.hash,
    })
    .onConflictDoUpdate((_existing) => ({
      fuses: 0n,
      expiry: 0n,
    }));

  await context.db.insert(activityEvent).values({
    id: eventId,
    name: '',
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
  const newFuses = existingWrapped ? (existingWrapped.fuses ?? 0n) | fuses : fuses;

  await context.db
    .insert(wrappedName)
    .values({
      node,
      owner: '0x0000000000000000000000000000000000000000',
      fuses: newFuses,
      expiry: 0n,
      txHash: event.transaction.hash,
    })
    .onConflictDoUpdate((_existing) => ({
      fuses: newFuses,
    }));
});

ponder.on('KiteWrapper:AgentAuthorized', async ({ event, context }) => {
  const { parentNode, agentNode, agentAddress, spendCapPerTx, expiry } = event.args;
  const eventId = `${event.transaction.hash}:${event.log.logIndex}`;
  const id = `${parentNode}:${agentNode}`;

  await context.db
    .insert(agentAuth)
    .values({
      id,
      parentNode,
      agentNode,
      agentAddress,
      spendCapPerTx,
      expiry,
      active: true,
      txHash: event.transaction.hash,
    })
    .onConflictDoUpdate((_existing) => ({
      spendCapPerTx: spendCapPerTx,
      expiry: expiry,
      active: true,
      txHash: event.transaction.hash,
    }));

  await context.db.insert(activityEvent).values({
    id: eventId,
    name: '',
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
    .select({
      parentNode: agentAuth.parentNode,
      agentNode: agentAuth.agentNode,
      spendCapPerTx: agentAuth.spendCapPerTx,
      expiry: agentAuth.expiry,
    })
    .from(agentAuth)
    .where(eq(agentAuth.id, id))
    .limit(1);

  const [existingAuth] = auth;
  if (existingAuth) {
    await context.db
      .insert(agentAuth)
      .values({
        id,
        parentNode: existingAuth.parentNode,
        agentNode: existingAuth.agentNode,
        agentAddress,
        spendCapPerTx: existingAuth.spendCapPerTx,
        expiry: existingAuth.expiry,
        active: false,
        txHash: event.transaction.hash,
      })
      .onConflictDoUpdate((_existing) => ({
        active: false,
        txHash: event.transaction.hash,
      }));
  }

  await context.db.insert(activityEvent).values({
    id: eventId,
    name: '',
    eventType: 'AgentRevoked',
    actor: agentAddress,
    fromAddr: agentAddress,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  });
});
