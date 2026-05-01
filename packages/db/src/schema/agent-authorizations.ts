import { bigint, boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const agentAuthorizations = pgTable(
  'agent_authorizations',
  {
    // Composite primary key: (parentNode, agentNode)
    parentNode: text('parent_node').notNull(),
    agentNode: text('agent_node').notNull(),
    // Agent's wallet address
    agentAddress: text('agent_address').notNull(),
    // Max spend per transaction (wei)
    spendCapPerTx: bigint('spend_cap_per_tx', { mode: 'bigint' }).notNull(),
    // Expiry timestamp (Unix)
    expiry: bigint('expiry', { mode: 'bigint' }).notNull(),
    // Active status
    active: boolean('active').notNull().default(true),
    // Timestamp when authorized
    authorizedAt: timestamp('authorized_at', { withTimezone: true }).notNull().defaultNow(),
    // Timestamp when revoked (null if still active)
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    // Tx hash that authorized the agent
    authTxHash: text('auth_tx_hash').notNull(),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.parentNode, table.agentNode],
    }),
    parentNodeIdx: index('agent_auth_parent_node_idx').on(table.parentNode),
    agentNodeIdx: index('agent_auth_agent_node_idx').on(table.agentNode),
    agentAddressIdx: index('agent_auth_agent_address_idx').on(table.agentAddress),
    // Index for listing active agents by parent with expiry DESC
    activeExpiryIdx: index('agent_auth_active_expiry_idx').on(table.active, table.expiry),
  }),
);

export type AgentAuthorization = typeof agentAuthorizations.$inferSelect;
export type NewAgentAuthorization = typeof agentAuthorizations.$inferInsert;
