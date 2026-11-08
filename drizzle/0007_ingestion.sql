CREATE TABLE IF NOT EXISTS "ingestion_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text NOT NULL,
	"dry_run" boolean DEFAULT true NOT NULL,
	"owner" text,
	"summary" jsonb
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingestion_candidates" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"source_url" text NOT NULL,
	"digest" text NOT NULL,
	"status" text NOT NULL,
	"reasons" text[],
	"payload" jsonb,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_slug" text,
	"run_id" text
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ingestion_candidates_source_ext_idx" ON "ingestion_candidates" ("source","external_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingestion_leases" (
	"name" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"token" text NOT NULL,
	"until" timestamp with time zone NOT NULL
);
