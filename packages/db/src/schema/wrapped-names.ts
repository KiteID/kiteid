import { sql } from 'drizzle-orm';
import { bigint, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const wrappedNames = pgTable(
  'wrapped_names',
  {
    // Primary key: node hash (bytes32 as hex string)
    node: text('node').primaryKey(),
    // Owner's wallet address (checksum normalized)
    owner: text('owner').notNull(),
    // 96-bit fuses bitmask
    fuses: bigint('fuses', { mode: 'bigint' }).notNull().default(sql`0`),
    // Unix timestamp when name expires
    expiry: bigint('expiry', { mode: 'bigint' }).notNull(),
    // Timestamp when wrapped (UTC)
    wrappedAt: timestamp('wrapped_at', { withTimezone: true }).notNull().defaultNow(),
    // Timestamp when unwrapped (null if still wrapped)
    unwrappedAt: timestamp('unwrapped_at', { withTimezone: true }),
    // Tx hash that wrapped the name
    txHash: text('tx_hash').notNull(),
    // Block number when wrapped
    blockNumber: bigint('block_number', { mode: 'bigint' }).notNull(),
  },
  (table) => ({
    ownerIdx: index('wrapped_names_owner_idx').on(table.owner),
    expiryIdx: index('wrapped_names_expiry_idx').on(table.expiry),
  }),
);

export type WrappedName = typeof wrappedNames.$inferSelect;
export type NewWrappedName = typeof wrappedNames.$inferInsert;
