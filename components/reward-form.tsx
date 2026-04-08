"use client";

import { CustomReward } from "@/types/domain";

export type RewardFormValues = {
  name: string;
  description: string;
  icon: string;
  cost_gold: number;
  cost_points: number;
};

export function rewardToFormValues(reward?: CustomReward | null): RewardFormValues {
  return {
    name: reward?.name ?? "",
    description: reward?.description ?? "",
    icon: reward?.icon ?? "🎁",
    cost_gold: reward?.cost_gold ?? 50,
    cost_points: reward?.cost_points ?? 0
  };
}

export function RewardForm({
  values,
  onChange,
  onCancel,
  onSubmit,
  submitLabel
}: {
  values: RewardFormValues;
  onChange: (values: RewardFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Name</span>
          <input className="input" value={values.name} onChange={(e) => onChange({ ...values, name: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Icon / Emoji</span>
          <input className="input" value={values.icon} onChange={(e) => onChange({ ...values, icon: e.target.value })} />
        </label>
      </div>
      <label className="space-y-1 text-sm block">
        <span>Beschreibung</span>
        <textarea className="input min-h-20" value={values.description} onChange={(e) => onChange({ ...values, description: e.target.value })} />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Kosten Gold</span>
          <input
            className="input"
            type="number"
            min={0}
            value={values.cost_gold}
            onChange={(e) => onChange({ ...values, cost_gold: Number(e.target.value) })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Kosten Punkte (optional)</span>
          <input
            className="input"
            type="number"
            min={0}
            value={values.cost_points}
            onChange={(e) => onChange({ ...values, cost_points: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={onSubmit}>
          {submitLabel}
        </button>
        <button className="rounded-xl border border-slate-600 px-4 py-2" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
