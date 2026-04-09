import { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">{title}</h3>
        {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      </div>
      {children}
    </section>
  );
}
