import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Required by Better Auth SIWE plugin — stores wallet ↔ user mappings
export const walletAddresses = pgTable(
  'wallet_address',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    address: varchar('address', { length: 42 }).notNull(),
    chainId: integer('chain_id').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Same checksummed wallet on the same chain may only map to one row.
    // Prevents the same wallet being attached to multiple users.
    addressChainUnique: uniqueIndex('wallet_address_address_chain_unique').on(
      table.address,
      table.chainId,
    ),
  }),
);

export type WalletAddress = typeof walletAddresses.$inferSelect;
