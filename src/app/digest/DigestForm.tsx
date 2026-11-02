"use client";
import { useActionState } from "react";
import { subscribe, type DigestState } from "./actions";
export default function DigestForm() {
  const [state, action, pending] = useActionState<DigestState, FormData>(subscribe, {});
  return (<form action={action} className="p-4 space-y-3">
    <label className="block text-sm font-bold">Email<input name="email" type="email" required className="mt-1 block w-full border border-line px-3 py-2" placeholder="you@example.com" /></label>
    <label className="block text-sm font-bold">Area<select name="area" className="mt-1 block w-full border border-line px-3 py-2"><option>All Central Florida</option><option>Orlando</option><option>Daytona / Port Orange</option><option>DeLand</option><option>New Smyrna / Ormond</option></select></label>
    <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
    <button disabled={pending} className="btn-red w-full">{pending ? "Saving…" : "Subscribe"}</button>
    {state.msg && <p className={`text-sm font-bold ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.msg}</p>}</form>);
}
