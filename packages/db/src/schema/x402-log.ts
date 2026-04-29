import { bigint, index, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const x402PaymentLog = pgTable(
  'x402_payment_log',
  {
    // Primary key: auto-increment ID
    id: serial('id').primaryKey(),
    // Agent node (who made the call)
    agentNode: text('agent_node').notNull(),
    // Parent name node (owner of agent)
    parentNode: text('parent_node').notNull(),
    // Agent's wallet address
    agentAddress: text('agent_address').notNull(),
    // Payee address (service recipient)
    payee: text('payee').notNull(),
    // Amount paid (wei or tokens)
    amount: bigint('amount', { mode: 'bigint' }).notNull(),
    // Resource URI (API path, RPC endpoint, etc.)
    resourceUri: text('resource_uri'),
    // Kite x402 facilitator tx hash
    facilitatorTxHash: text('facilitator_tx_hash'),
    // Settlement status: 'pending', 'confirmed', 'failed', 'refunded'
    status: text('status').notNull().default('pending'),
    // Error reason (if failed)
    errorReason: text('error_reason'),
    // Timestamp when payment occurred (UTC)
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    agentNodeIdx: index('x402_log_agent_node_idx').on(table.agentNode),
    parentNodeIdx: index('x402_log_parent_node_idx').on(table.parentNode),
    agentAddressIdx: index('x402_log_agent_address_idx').on(table.agentAddress),
    // Combined index for listing payments by parent with recent first
    parentOccurredIdx: index('x402_log_parent_occurred_idx').on(table.parentNode, table.occurredAt),
    statusIdx: index('x402_log_status_idx').on(table.status),
  }),
);

export type X402PaymentLog = typeof x402PaymentLog.$inferSelect;
export type NewX402PaymentLog = typeof x402PaymentLog.$inferInsert;
