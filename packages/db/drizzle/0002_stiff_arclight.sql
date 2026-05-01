CREATE TABLE "relayer_nonces" (
	"address" varchar(42) NOT NULL,
	"nonce" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "relayer_nonces_address_nonce_pk" PRIMARY KEY("address","nonce")
);
--> statement-breakpoint
CREATE INDEX "relayer_nonces_address_idx" ON "relayer_nonces" USING btree ("address");--> statement-breakpoint
CREATE INDEX "relayer_nonces_expires_at_idx" ON "relayer_nonces" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "relayer_nonces_used_at_idx" ON "relayer_nonces" USING btree ("used_at");
