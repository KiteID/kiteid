-- Idempotent migration: deduplicate any existing rows then add unique index on
-- (address, chain_id). Before this migration, the SIWE plugin could insert
-- multiple rows for the same wallet on the same chain if the user signed in
-- twice. The unique index closes that hole.

-- Keep the oldest row per (address, chain_id), delete the rest.
DELETE FROM "wallet_address" a
USING "wallet_address" b
WHERE a.created_at > b.created_at
  AND a.address    = b.address
  AND a.chain_id   = b.chain_id;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wallet_address_address_chain_unique"
  ON "wallet_address" USING btree ("address","chain_id");
