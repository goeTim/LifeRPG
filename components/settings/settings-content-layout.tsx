import { ReactNode } from "react";

export function SettingsContentLayout({ children }: { children: ReactNode }) {
  return <section className="min-h-[65vh] space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-6">{children}</section>;
}
