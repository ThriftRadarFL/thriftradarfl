"use client";
export default function ConfirmButton({ children, message, className = "text-xs text-red-700 hover:underline" }: { children: React.ReactNode; message: string; className?: string }) {
  return <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>{children}</button>;
}
