import { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function SectionHeader({ title, description, action }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
