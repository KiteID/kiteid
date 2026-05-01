import { index, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const relayerNonces = pgTable(
  'relayer_nonces',
  {
    address: varchar('address', { length: 42 }).notNull(),
    nonce: text('nonce').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.address, t.nonce] }),
    addressIdx: index('relayer_nonces_address_idx').on(t.address),
    expiresAtIdx: index('relayer_nonces_expires_at_idx').on(t.expiresAt),
    usedAtIdx: index('relayer_nonces_used_at_idx').on(t.usedAt),
  }),
);
