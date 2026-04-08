"use client";

import { useRouter } from "next/navigation";
import { CountBadge } from "@/components/settings/count-badge";

type Props = {
  targetSection: string;
  label: string;
  active?: boolean;
  count?: number;
};

export function SettingsNavItem({ targetSection, label, active = false, count }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/settings?section=${targetSection}`)}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
        active
          ? "border-cyan-500/70 bg-cyan-500/10 text-cyan-200"
          : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
      }`}
    >
      <span>{label}</span>
      {typeof count === "number" && <CountBadge count={count} />}
    </button>
  );
}
