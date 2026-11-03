CREATE TABLE IF NOT EXISTS "color_tag_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"venue" text NOT NULL,
	"color" text NOT NULL,
	"discount_pct" integer,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"week_of" text NOT NULL,
	"expires_on" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "color_tag_reports_expires_idx" ON "color_tag_reports" ("expires_on");
