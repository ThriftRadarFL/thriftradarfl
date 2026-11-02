import { PageHead } from "./ui";
export default function Prose({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <div><PageHead title={title} sub={sub} /><article className="panel prose-page max-w-3xl p-5">{children}</article></div>;
}
