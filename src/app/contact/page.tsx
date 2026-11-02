import { PageHead } from "@/components/ui";
import { Field, Honeypot, Notice, inp } from "@/components/FormBits";
import { sendContact } from "../submit/actions";
export const metadata = { title: "Contact", description: "Report a wrong listing, suggest a store, or get in touch with ThriftRadarFL.", alternates: { canonical: "/contact" } };
export default async function Contact({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  return (<div><PageHead title="Contact us" sub="Wrong listing? Missing store? Question about the digest? We read everything." />
    <Notice ok={sp.ok} err={sp.err} okText="Thanks — your message was received. We'll reply by email if needed." />
    <form action={sendContact} className="panel max-w-xl space-y-3 p-5"><Honeypot />
      <Field name="name" label="Name" req maxLength={100} autoComplete="name" /><Field name="email" label="Email" type="email" req autoComplete="email" />
      <label className="block text-xs font-bold">Message<span className="text-red-700" aria-hidden="true"> *</span><textarea name="message" rows={6} required minLength={10} maxLength={4000} className={inp} /></label>
      <button className="btn-red">Send message</button></form></div>);
}
