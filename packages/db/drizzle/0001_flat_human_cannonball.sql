CREATE TABLE "agent_authorizations" (
	"parent_node" text NOT NULL,
	"agent_node" text NOT NULL,
	"agent_address" text NOT NULL,
	"spend_cap_per_tx" bigint NOT NULL,
	"expiry" bigint NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"authorized_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"auth_tx_hash" text NOT NULL,
	CONSTRAINT "agent_authorizations_parent_node_agent_node_pk" PRIMARY KEY("parent_node","agent_node")
);
--> statement-breakpoint
CREATE TABLE "passport_bindings" (
	"id" serial PRIMARY KEY NOT NULL,
	"node" text NOT NULL,
	"passport_commitment" text NOT NULL,
	"passport_id_hash" text,
	"binding_salt" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"bound_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unbound_at" timestamp with time zone,
	"tx_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wrapped_names" (
	"node" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"fuses" bigint DEFAULT 0 NOT NULL,
	"expiry" bigint NOT NULL,
	"wrapped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unwrapped_at" timestamp with time zone,
	"tx_hash" text NOT NULL,
	"block_number" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "x402_payment_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_node" text NOT NULL,
	"parent_node" text NOT NULL,
	"agent_address" text NOT NULL,
	"payee" text NOT NULL,
	"amount" bigint NOT NULL,
	"resource_uri" text,
	"facilitator_tx_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_reason" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "agent_auth_parent_node_idx" ON "agent_authorizations" USING btree ("parent_node");--> statement-breakpoint
CREATE INDEX "agent_auth_agent_node_idx" ON "agent_authorizations" USING btree ("agent_node");--> statement-breakpoint
CREATE INDEX "agent_auth_agent_address_idx" ON "agent_authorizations" USING btree ("agent_address");--> statement-breakpoint
CREATE INDEX "agent_auth_active_expiry_idx" ON "agent_authorizations" USING btree ("active","expiry");--> statement-breakpoint
CREATE INDEX "passport_bindings_node_idx" ON "passport_bindings" USING btree ("node");--> statement-breakpoint
CREATE INDEX "passport_bindings_status_idx" ON "passport_bindings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "passport_bindings_passport_id_hash_idx" ON "passport_bindings" USING btree ("passport_id_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "passport_bindings_unique_node_active" ON "passport_bindings" USING btree ("node");--> statement-breakpoint
CREATE INDEX "wrapped_names_owner_idx" ON "wrapped_names" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "wrapped_names_expiry_idx" ON "wrapped_names" USING btree ("expiry");--> statement-breakpoint
CREATE INDEX "x402_log_agent_node_idx" ON "x402_payment_log" USING btree ("agent_node");--> statement-breakpoint
CREATE INDEX "x402_log_parent_node_idx" ON "x402_payment_log" USING btree ("parent_node");--> statement-breakpoint
CREATE INDEX "x402_log_agent_address_idx" ON "x402_payment_log" USING btree ("agent_address");--> statement-breakpoint
CREATE INDEX "x402_log_parent_occurred_idx" ON "x402_payment_log" USING btree ("parent_node","occurred_at");--> statement-breakpoint
CREATE INDEX "x402_log_status_idx" ON "x402_payment_log" USING btree ("status");