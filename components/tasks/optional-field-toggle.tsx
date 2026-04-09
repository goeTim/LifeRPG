import { ReactNode } from "react";

type OptionalFieldToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  children: ReactNode;
};

export function OptionalFieldToggle({ id, checked, onChange, label, hint, children }: OptionalFieldToggleProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500"
        />
        <span>
          <span className="block text-sm font-medium text-slate-100">{label}</span>
          {hint && <span className="block text-xs text-slate-400">{hint}</span>}
        </span>
      </label>
      <div className="mt-3">{children}</div>
    </div>
  );
}
