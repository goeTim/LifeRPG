"use client";

import { useState } from "react";
import { InventoryItemCard } from "@/components/inventory-item-card";
import { InventoryItem } from "@/types/domain";

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Request fehlgeschlagen" }))) as { error?: string };
    throw new Error(payload.error ?? "Request fehlgeschlagen");
  }
  return response.json();
}

export function InventoryGrid({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);

  const refresh = (payload: { inventory: InventoryItem[] }) => setItems(payload.inventory);

  return (
    <section className="space-y-4">
      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <InventoryItemCard
            key={item.id}
            item={item}
            onUse={async (id) => {
              try {
                setError(null);
                const payload = await request(`/api/inventory/${id}/use`, { method: "POST" });
                refresh(payload);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
              }
            }}
            onToggle={async (id) => {
              try {
                setError(null);
                const payload = await request(`/api/inventory/${id}/toggle-active`, { method: "POST" });
                refresh(payload);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
              }
            }}
            onSetMain={async (id) => {
              try {
                setError(null);
                const payload = await request(`/api/inventory/${id}/set-main-title`, { method: "POST" });
                refresh(payload);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
              }
            }}
          />
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-slate-400">Inventar ist leer. Kaufe zuerst etwas im Shop.</p>}
    </section>
  );
}
