import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
export const hasDb = !!url;
// Serverless instances get frozen between requests; pooled sockets can go stale and hang a query until our timeout.
// resetDb() drops the pool so the next query opens a fresh connection (used by data.ts before retrying a timed-out read).
const make = () => postgres(url!, { prepare: false, connect_timeout: 3, max: 5, idle_timeout: 10, max_lifetime: 60 * 5 });
let client = url ? make() : null;
let instance = client ? drizzle(client, { schema }) : null;
export const getDb = () => instance;
export function resetDb() {
  if (!url) return; const old = client; client = make(); instance = drizzle(client, { schema });
  old?.end({ timeout: 5 }).catch(() => {});
}
