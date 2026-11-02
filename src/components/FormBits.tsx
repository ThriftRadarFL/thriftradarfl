export const inp = "mt-1 block w-full border border-line bg-white px-2 py-1.5 text-sm font-normal";
export function Field({ label, req, hint, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; req?: boolean; hint?: string }) {
  return <label className="block text-xs font-bold">{label}{req && <span className="text-red-700" aria-hidden="true"> *</span>}<input {...p} required={req} className={inp} />{hint && <span className="mt-0.5 block font-normal text-gray-600">{hint}</span>}</label>;
}
export const Honeypot = () => <div aria-hidden="true" className="hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>;
export function Notice({ ok, err, okText }: { ok?: string; err?: string; okText: string }) {
  if (ok) return <p role="status" className="mb-3 border border-teal bg-teal/10 p-3 text-sm font-bold text-teal">{okText}</p>;
  if (err) return <p role="alert" className="mb-3 border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-800">{err}</p>;
  return null;
}
