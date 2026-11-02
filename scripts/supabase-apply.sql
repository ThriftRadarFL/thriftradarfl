-- ThriftRadarFL schema apply
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TYPE "public"."deal_kind" AS ENUM('color_tag', 'half_off', 'senior_day', 'restock', 'bins_rotation', 'dollar_day');
CREATE TYPE "public"."org_type" AS ENUM('estate_co', 'auction_house', 'thrift_chain', 'independent');
CREATE TYPE "public"."sale_source" AS ENUM('estatesales_net', 'manual', 'submitted');
CREATE TYPE "public"."sale_status" AS ENUM('upcoming', 'live', 'ended');
CREATE TYPE "public"."sale_type" AS ENUM('estate', 'auction', 'moving', 'yard', 'warehouse');
CREATE TYPE "public"."sub_tier" AS ENUM('free', 'paid');
CREATE TYPE "public"."venue_type" AS ENUM('thrift', 'outlet_bins', 'auction_house', 'consignment', 'flea');
CREATE TABLE "deal_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"venue_id" integer NOT NULL,
	"kind" "deal_kind" NOT NULL,
	"rrule" text,
	"day_of_week" integer,
	"start_time" time,
	"color" text,
	"discount_pct" integer,
	"description" text,
	"verified_at" timestamp with time zone,
	"source" text
);

CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "org_type" NOT NULL,
	"website" text,
	"phone" text,
	"source_url" text,
	"is_featured" boolean DEFAULT false NOT NULL
);

CREATE TABLE "sale_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"discount_pct" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "sale_tags" (
	"sale_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "sale_tags_sale_id_tag_id_pk" PRIMARY KEY("sale_id","tag_id")
);

CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"org_id" integer,
	"venue_id" integer,
	"title" text NOT NULL,
	"type" "sale_type" NOT NULL,
	"address" text,
	"address_release_at" timestamp with time zone,
	"city" text NOT NULL,
	"zip" text,
	"lat" double precision,
	"lng" double precision,
	"payment_methods" text[],
	"terms_text" text,
	"source" "sale_source" DEFAULT 'manual' NOT NULL,
	"source_url" text,
	"status" "sale_status" DEFAULT 'upcoming' NOT NULL,
	"featured_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_slug_unique" UNIQUE("slug")
);

CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"zip" text,
	"interests" text[],
	"tier" "sub_tier" DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);

CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);

CREATE TABLE "venues" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"org_id" integer,
	"name" text NOT NULL,
	"type" "venue_type" NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"zip" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"phone" text,
	"hours_json" jsonb,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "venues_slug_unique" UNIQUE("slug")
);

ALTER TABLE "deal_rules" ADD CONSTRAINT "deal_rules_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sale_days" ADD CONSTRAINT "sale_days_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sale_tags" ADD CONSTRAINT "sale_tags_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sale_tags" ADD CONSTRAINT "sale_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sales" ADD CONSTRAINT "sales_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales" ADD CONSTRAINT "sales_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "venues" ADD CONSTRAINT "venues_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
ALTER TYPE "public"."sale_type" ADD VALUE 'thrift';
ALTER TYPE "public"."sale_type" ADD VALUE 'outlet_bins';
ALTER TYPE "public"."venue_type" ADD VALUE 'estate_company';
ALTER TABLE "subscribers" ADD COLUMN "area" text;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
