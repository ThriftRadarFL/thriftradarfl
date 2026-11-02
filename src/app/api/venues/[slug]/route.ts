import { getVenue } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET(_r: Request, { params }: { params: Promise<{ slug: string }> }) { const v = await getVenue((await params).slug); return v ? Response.json({ data: v }) : Response.json({ error: "not found" }, { status: 404 }); }
