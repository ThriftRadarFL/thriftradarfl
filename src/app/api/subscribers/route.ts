import { addDigestSubscriber } from "@/lib/data";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const email = String(b.email ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "invalid email" }, { status: 400 });
  const added = await addDigestSubscriber(email, String(b.area ?? "All")); return Response.json({ added }, { status: added ? 201 : 200 });
}
