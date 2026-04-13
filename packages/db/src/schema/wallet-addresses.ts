import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

// Required by Better Auth SIWE plugin — stores wallet ↔ user mappings
export const walletAddresses = pgTable('wallet_address', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  address: varchar('address', { length: 42 }).notNull(),
  chainId: integer('chain_id').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type WalletAddress = typeof walletAddresses.$inferSelect;
