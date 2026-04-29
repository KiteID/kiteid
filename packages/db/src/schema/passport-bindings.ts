import { index, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const passportBindings = pgTable(
  'passport_bindings',
  {
    // Primary key: auto-increment ID
    id: serial('id').primaryKey(),
    // Name node hash (bytes32 as hex string)
    node: text('node').notNull(),
    // Kite Passport commitment (bytes32 as hex string): keccak256(passportId|salt)
    passportCommitment: text('passport_commitment').notNull(),
    // Hash of passportId for lookups (sha256 as hex string)
    passportIdHash: text('passport_id_hash'),
    // Random salt used in commitment (bytes32 as hex string)
    bindingSalt: text('binding_salt').notNull(),
    // Status: 'active', 'unbound', 'expired'
    status: text('status').notNull().default('active'),
    // Timestamp when bound
    boundAt: timestamp('bound_at', { withTimezone: true }).notNull().defaultNow(),
    // Timestamp when unbound (null if still active)
    unboundAt: timestamp('unbound_at', { withTimezone: true }),
    // Tx hash that bound the passport
    txHash: text('tx_hash').notNull(),
  },
  (table) => ({
    nodeIdx: index('passport_bindings_node_idx').on(table.node),
    statusIdx: index('passport_bindings_status_idx').on(table.status),
    passportIdHashIdx: index('passport_bindings_passport_id_hash_idx').on(table.passportIdHash),
    // Unique constraint: only one active binding per node
    uniqueNodeActive: uniqueIndex('passport_bindings_unique_node_active').on(table.node),
  }),
);

export type PassportBinding = typeof passportBindings.$inferSelect;
export type NewPassportBinding = typeof passportBindings.$inferInsert;
