"use client";

import { ShopItem, ShopItemType } from "@/types/domain";

const ITEM_TYPES: ShopItemType[] = ["consumable", "cosmetic", "title", "unlockable"];

export type ItemFormValues = {
  name: string;
  description: string;
  icon: string;
  cost_gold: number;
  cost_points: number;
  item_type: ShopItemType;
  rarity: string;
  color: string;
};

export function itemToFormValues(item?: ShopItem | null): ItemFormValues {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    icon: item?.icon ?? "✨",
    cost_gold: item?.cost_gold ?? 100,
    cost_points: item?.cost_points ?? 0,
    item_type: item?.item_type ?? "consumable",
    rarity: item?.rarity ?? "",
    color: item?.color ?? ""
  };
}

export function ItemForm({
  values,
  onChange,
  onCancel,
  onSubmit,
  submitLabel
}: {
  values: ItemFormValues;
  onChange: (values: ItemFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm md:col-span-2">
          <span>Name</span>
          <input className="input" value={values.name} onChange={(e) => onChange({ ...values, name: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Icon</span>
          <input className="input" value={values.icon} onChange={(e) => onChange({ ...values, icon: e.target.value })} />
        </label>
      </div>
      <label className="space-y-1 text-sm block">
        <span>Beschreibung</span>
        <textarea className="input min-h-20" value={values.description} onChange={(e) => onChange({ ...values, description: e.target.value })} />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span>Typ</span>
          <select className="input" value={values.item_type} onChange={(e) => onChange({ ...values, item_type: e.target.value as ShopItemType })}>
            {ITEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>Kosten Gold</span>
          <input className="input" type="number" min={0} value={values.cost_gold} onChange={(e) => onChange({ ...values, cost_gold: Number(e.target.value) })} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Kosten Punkte</span>
          <input
            className="input"
            type="number"
            min={0}
            value={values.cost_points}
            onChange={(e) => onChange({ ...values, cost_points: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Rarity (optional)</span>
          <input className="input" value={values.rarity} onChange={(e) => onChange({ ...values, rarity: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Color-Metadaten (optional)</span>
          <input className="input" value={values.color} onChange={(e) => onChange({ ...values, color: e.target.value })} />
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
