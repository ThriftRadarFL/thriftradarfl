CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"sale" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deal_rules" ADD COLUMN "rule_key" text;--> statement-breakpoint
ALTER TABLE "deal_rules" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "deal_rules" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "deal_rules" ADD CONSTRAINT "deal_rules_rule_key_unique" UNIQUE("rule_key");