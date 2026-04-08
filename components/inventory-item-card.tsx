"use client";

import { TitleManager } from "@/components/title-manager";
import { getInventoryMeta } from "@/lib/inventory";
import { InventoryItem } from "@/types/domain";

export function InventoryItemCard({
  item,
  onUse,
  onToggle,
  onSetMain
}: {
  item: InventoryItem;
  onUse: (id: string) => void;
  onToggle: (id: string) => void;
  onSetMain: (id: string) => void;
}) {
  const meta = getInventoryMeta(item);

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">
          {meta.icon} {meta.name}
        </h3>
        <span className="text-xs uppercase tracking-wide text-violet-300">{meta.type}</span>
      </div>
      <p className="text-sm text-slate-300">{meta.description || "Keine Beschreibung"}</p>
      <p className="mt-2 text-sm text-cyan-300">Menge: {item.quantity}</p>
      {(item.is_active || meta.type === "cosmetic" || meta.type === "title") && (
        <p className="mt-1 text-xs text-emerald-300">Status: {item.is_active ? "aktiv" : "inaktiv"}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {meta.consumable && (
          <button className="rounded-xl border border-cyan-600 px-3 py-1 text-sm text-cyan-300" onClick={() => onUse(item.id)}>
            {meta.type === "reward" ? "Einlösen" : "Benutzen"}
          </button>
        )}
        {(meta.type === "cosmetic" || meta.type === "title") && (
          <button className="rounded-xl border border-violet-600 px-3 py-1 text-sm" onClick={() => onToggle(item.id)}>
            {item.is_active ? "Deaktivieren" : "Aktivieren"}
          </button>
        )}
        {meta.type === "title" && <TitleManager entry={item} onToggle={onToggle} onSetMain={onSetMain} />}
      </div>
    </article>
  );
}
