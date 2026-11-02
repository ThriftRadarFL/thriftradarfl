import { pgTable, pgEnum, serial, text, integer, boolean, timestamp, date, time, doublePrecision, jsonb, primaryKey } from "drizzle-orm/pg-core";

export const orgType = pgEnum("org_type", ["estate_co", "auction_house", "thrift_chain", "independent"]);
export const venueType = pgEnum("venue_type", ["thrift", "outlet_bins", "auction_house", "consignment", "flea", "estate_company"]);
export const saleType = pgEnum("sale_type", ["estate", "auction", "moving", "yard", "warehouse", "thrift", "outlet_bins"]);
export const saleSource = pgEnum("sale_source", ["estatesales_net", "manual", "submitted"]);
export const saleStatus = pgEnum("sale_status", ["upcoming", "live", "ended"]);
export const dealKind = pgEnum("deal_kind", ["color_tag", "half_off", "senior_day", "restock", "bins_rotation", "dollar_day"]);
export const subTier = pgEnum("sub_tier", ["free", "paid"]);

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: orgType("type").notNull(),
  website: text("website"),
  phone: text("phone"),
  sourceUrl: text("source_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
});

// lat/lng as doubles for now; add a PostGIS geography column + GIST index in a later migration
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  orgId: integer("org_id").references(() => organizations.id),
  name: text("name").notNull(),
  type: venueType("type").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  zip: text("zip").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  phone: text("phone"),
  hoursJson: jsonb("hours_json"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  orgId: integer("org_id").references(() => organizations.id),
  venueId: integer("venue_id").references(() => venues.id),
  title: text("title").notNull(),
  type: saleType("type").notNull(),
  address: text("address"),
  addressReleaseAt: timestamp("address_release_at", { withTimezone: true }),
  city: text("city").notNull(),
  zip: text("zip"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  paymentMethods: text("payment_methods").array(),
  termsText: text("terms_text"),
  source: saleSource("source").default("manual").notNull(),
  sourceUrl: text("source_url"),
  status: saleStatus("status").default("upcoming").notNull(),
  featuredUntil: timestamp("featured_until", { withTimezone: true }),
  published: boolean("published").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const saleDays = pgTable("sale_days", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  discountPct: integer("discount_pct").default(0).notNull(),
});

export const dealRules = pgTable("deal_rules", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").references(() => venues.id, { onDelete: "cascade" }).notNull(),
  kind: dealKind("kind").notNull(),
  rrule: text("rrule"),
  dayOfWeek: integer("day_of_week"), // 0=Sun
  startTime: time("start_time"),
  color: text("color"),
  discountPct: integer("discount_pct"),
  description: text("description"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  source: text("source"),
  ruleKey: text("rule_key").unique(),
  label: text("label"),
  verified: boolean("verified").default(false).notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const saleTags = pgTable("sale_tags", {
  saleId: integer("sale_id").references(() => sales.id, { onDelete: "cascade" }).notNull(),
  tagId: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
}, (t) => [primaryKey({ columns: [t.saleId, t.tagId] })]);

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  zip: text("zip"),
  interests: text("interests").array(),
  area: text("area"),
  tier: subTier("tier").default("free").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  sale: jsonb("sale").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
