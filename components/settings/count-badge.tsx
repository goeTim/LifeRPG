export function CountBadge({ count }: { count: number }) {
  return <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{count}</span>;
}
