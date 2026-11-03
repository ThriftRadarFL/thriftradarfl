"use client";
import Link from "next/link";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="panel mx-auto mt-8 max-w-xl" role="alert"><h1 className="panel-head">Something went wrong</h1>
      <div className="p-4 text-sm">
      <p className="text-gray-700">We couldn&apos;t load this page. Please try again — if it keeps happening, <Link href="/contact" className="link">let us know</Link>.</p>
      {error.digest && <p className="mt-1 text-xs text-gray-600">Reference: {error.digest}</p>}
      <div className="mt-4 flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn-red">Try again</button>
        <Link href="/" className="underline self-center text-royal">Back to home</Link>
      </div></div>
    </div>
  );
}
