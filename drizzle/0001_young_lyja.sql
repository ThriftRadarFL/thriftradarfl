ALTER TYPE "public"."sale_type" ADD VALUE 'thrift';--> statement-breakpoint
ALTER TYPE "public"."sale_type" ADD VALUE 'outlet_bins';--> statement-breakpoint
ALTER TYPE "public"."venue_type" ADD VALUE 'estate_company';--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "area" text;