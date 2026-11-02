import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
export const hasDb = !!url;
export const db = url ? drizzle(postgres(url, { prepare: false }), { schema }) : null;
