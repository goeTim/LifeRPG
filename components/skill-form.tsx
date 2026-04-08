"use client";

import { ATTRIBUTE_META, ATTRIBUTE_ORDER, SKILL_COLOR_PRESETS } from "@/lib/constants";
import { AttributeKey, Skill } from "@/types/domain";

export type SkillFormValues = {
  name: string;
  description: string;
  icon: string;
  color: string;
  primary_attribute: AttributeKey;
  secondary_attribute: "" | AttributeKey;
};

const DEFAULT_VALUES: SkillFormValues = {
  name: "",
  description: "",
  icon: "",
  color: "",
  primary_attribute: "discipline",
  secondary_attribute: ""
};

export function skillToFormValues(skill?: Skill | null): SkillFormValues {
  if (!skill) return DEFAULT_VALUES;
  return {
    name: skill.name,
    description: skill.description ?? "",
    icon: skill.icon ?? "",
    color: skill.color ?? "",
    primary_attribute: skill.primary_attribute,
    secondary_attribute: skill.secondary_attribute ?? ""
  };
}

export function SkillForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  onCancel
}: {
  values: SkillFormValues;
  onChange: (next: SkillFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="space-y-1">
        <label className="text-sm text-slate-300">Name</label>
        <input className="input" value={values.name} onChange={(e) => onChange({ ...values, name: e.target.value })} placeholder="z. B. Fitness" />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-300">Beschreibung</label>
        <textarea
          className="input min-h-20"
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          placeholder="Warum trainierst du diesen Lebensbereich?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Icon / Emoji</label>
          <input className="input" value={values.icon} onChange={(e) => onChange({ ...values, icon: e.target.value })} placeholder="💪" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Farbe (optional)</label>
          <input className="input" value={values.color} onChange={(e) => onChange({ ...values, color: e.target.value })} placeholder="#22c55e" />
          <div className="flex flex-wrap gap-2 pt-1">
            {SKILL_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="h-5 w-5 rounded-full border border-slate-700"
                style={{ backgroundColor: preset }}
                onClick={() => onChange({ ...values, color: preset })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Primäres Hauptattribut</label>
          <select
            className="input"
            value={values.primary_attribute}
            onChange={(e) => onChange({ ...values, primary_attribute: e.target.value as AttributeKey })}
          >
            {ATTRIBUTE_ORDER.map((attr) => (
              <option key={attr} value={attr}>
                {ATTRIBUTE_META[attr].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Sekundäres Hauptattribut</label>
          <select
            className="input"
            value={values.secondary_attribute}
            onChange={(e) => onChange({ ...values, secondary_attribute: e.target.value as "" | AttributeKey })}
          >
            <option value="">Keins</option>
            {ATTRIBUTE_ORDER.map((attr) => (
              <option key={attr} value={attr}>
                {ATTRIBUTE_META[attr].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-primary" type="button" onClick={onSubmit}>
          {submitLabel}
        </button>
        {onCancel && (
          <button className="rounded-xl border border-slate-600 px-4 py-2 text-sm" type="button" onClick={onCancel}>
            Abbrechen
          </button>
        )}
      </div>
    </div>
  );
}
