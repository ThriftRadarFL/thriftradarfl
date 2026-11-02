// POST {url} → draft Sale parsed from the listing's JSON-LD (not saved). Admin only.
import { isAdminRequest } from "@/lib/auth";
import { importFromUrl } from "@/lib/importer";
import { handle, json, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
export const POST = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const { url } = await readBody(req, 2000);
  try { return json({ draft: await importFromUrl(String(url ?? "")) }); } catch (e) { throw new HttpError(422, (e as Error).message); }
});
