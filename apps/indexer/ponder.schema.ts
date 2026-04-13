import { index, onchainTable } from 'ponder';

export const domain = onchainTable(
  'domain',
  (t) => ({
    name: t.text().primaryKey(),
    namehash: t.hex().notNull(),
    tokenId: t.hex(),
    labelhash: t.hex().notNull(),
    owner: t.hex().notNull(),
    registrant: t.hex(),
    resolver: t.hex(),
    registeredAt: t.bigint().notNull(),
    expiresAt: t.bigint().notNull(),
    isPrimaryFor: t.hex(),
    createdAtBlock: t.bigint().notNull(),
  }),
  (table) => ({
    ownerIdx: index().on(table.owner),
    expiresAtIdx: index().on(table.expiresAt),
    namehashIdx: index().on(table.namehash),
    labelhashIdx: index().on(table.labelhash),
  }),
);

export const resolverRecord = onchainTable(
  'resolver_record',
  (t) => ({
    id: t.text().primaryKey(), // format: {name}:{type}:{key}
    name: t.text().notNull(),
    recordType: t.text().notNull(), // 'addr' | 'text' | 'contenthash'
    key: t.text().notNull(),
    value: t.text().notNull(),
    updatedAt: t.bigint().notNull(),
  }),
  (table) => ({
    nameIdx: index().on(table.name),
  }),
);

export const activityEvent = onchainTable(
  'activity_event',
  (t) => ({
    id: t.text().primaryKey(), // format: {txHash}:{logIndex}
    name: t.text(),
    eventType: t.text().notNull(),
    actor: t.hex().notNull(),
    fromAddr: t.hex(),
    toAddr: t.hex(),
    priceKite: t.text(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    nameIdx: index().on(table.name),
    actorIdx: index().on(table.actor),
    timestampIdx: index().on(table.timestamp),
  }),
);
