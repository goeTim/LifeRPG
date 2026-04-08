"use client";

import { useState } from "react";
import { ShopItemCard } from "@/components/shop-item-card";
import { canAfford } from "@/lib/inventory";

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

export function ShopGrid({
  initialGold,
  initialPoints,
  rewards,
  items
}: {
  initialGold: number;
  initialPoints: number;
  rewards: ShopUiItem[];
  items: Record<string, ShopUiItem[]>;
}) {
  const [gold, setGold] = useState(initialGold);
  const [points, setPoints] = useState(initialPoints);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (item: ShopUiItem) => {
    try {
      setError(null);
      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, id: item.id })
      });
      const payload = (await response.json()) as { error?: string; wallet?: { gold: number; points: number } };
      if (!response.ok) throw new Error(payload.error ?? "Kauf fehlgeschlagen");
      if (payload.wallet) {
        setGold(payload.wallet.gold);
        setPoints(payload.wallet.points);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kauf fehlgeschlagen");
    }
  };

  const sections = [
    { key: "rewards", title: "Rewards", data: rewards },
    { key: "consumable", title: "Consumables", data: items.consumable ?? [] },
    { key: "cosmetic", title: "Cosmetics", data: items.cosmetic ?? [] },
    { key: "title", title: "Titles", data: items.title ?? [] },
    { key: "unlockable", title: "Unlockables", data: items.unlockable ?? [] }
  ];

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}
      <p className="text-sm text-slate-300">
        Kontostand: {gold} Gold · {points} Punkte
      </p>
      {sections.map((section) => (
        <section key={section.key} className="card space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {section.data.map((item) => (
              <ShopItemCard
                key={`${item.kind}-${item.id}`}
                item={item}
                canBuy={canAfford({ gold, points, costGold: item.cost_gold, costPoints: item.cost_points })}
                onBuy={handleBuy}
              />
            ))}
          </div>
          {section.data.length === 0 && <p className="text-sm text-slate-400">Keine Einträge in dieser Kategorie.</p>}
        </section>
      ))}
    </div>
  );
}
