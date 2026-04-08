"use client";

import { PurchaseButton } from "@/components/purchase-button";

type ShopUiItem = {
  id: string;
  kind: "reward" | "item";
  name: string;
  description: string | null;
  icon: string;
  cost_gold: number;
  cost_points: number;
  type: string;
};

export function ShopItemCard({ item, canBuy, onBuy }: { item: ShopUiItem; canBuy: boolean; onBuy: (item: ShopUiItem) => void }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          {item.icon} {item.name}
        </h3>
        <span className="text-xs uppercase tracking-wide text-violet-300">{item.type}</span>
      </div>
      <p className="mb-4 text-sm text-slate-300">{item.description || "Keine Beschreibung"}</p>
      <p className="mb-4 text-sm text-amber-300">
        {item.cost_gold} Gold {item.cost_points > 0 ? `· ${item.cost_points} Punkte` : ""}
      </p>
      <PurchaseButton disabled={!canBuy} onClick={() => onBuy(item)} />
    </article>
  );
}
