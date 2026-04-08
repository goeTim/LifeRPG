"use client";

import { useMemo, useState } from "react";
import { ItemForm, itemToFormValues, ItemFormValues } from "@/components/item-form";
import { SettingsSection } from "@/components/settings-section";
import { ShopItem } from "@/types/domain";

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Request fehlgeschlagen" }))) as { error?: string };
    throw new Error(payload.error ?? "Request fehlgeschlagen");
  }
  return response.json();
}

export function ItemsSettingsList({ initialItems }: { initialItems: ShopItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<ShopItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState<ItemFormValues>(itemToFormValues());
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(() => (editing ? `Item bearbeiten: ${editing.name}` : "Neues Item erstellen"), [editing]);

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setValues(itemToFormValues());
  };

  return (
    <SettingsSection title="Items verwalten" description="Ingame-Items für Shop und Inventar. Unterstützt Consumable, Cosmetic, Title und Unlockable.">
      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}
      {!creating && !editing && (
        <button className="btn-primary" onClick={() => setCreating(true)}>
          + Item hinzufügen
        </button>
      )}
      {(creating || editing) && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ItemForm
            values={values}
            onChange={setValues}
            onCancel={closeForm}
            submitLabel={editing ? "Item speichern" : "Item erstellen"}
            onSubmit={async () => {
              setError(null);
              try {
                if (editing) {
                  const payload = await request(`/api/items/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) });
                  setItems((current) => current.map((item) => (item.id === editing.id ? payload.item : item)));
                } else {
                  const payload = await request("/api/items", { method: "POST", body: JSON.stringify(values) });
                  setItems((current) => [payload.item, ...current]);
                }
                closeForm();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Item konnte nicht gespeichert werden.");
              }
            }}
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">
                {item.icon ?? "✨"} {item.name}
              </h3>
              <span className="text-xs uppercase tracking-wide text-violet-300">{item.item_type}</span>
            </div>
            <p className="mb-3 text-sm text-slate-300">{item.description || "Keine Beschreibung"}</p>
            <p className="mb-3 text-sm text-amber-300">
              {item.cost_gold} Gold {item.cost_points > 0 ? `· ${item.cost_points} Punkte` : ""}
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-cyan-600 px-3 py-1 text-sm text-cyan-300"
                onClick={() => {
                  setCreating(false);
                  setEditing(item);
                  setValues(itemToFormValues(item));
                }}
              >
                Bearbeiten
              </button>
              <button
                className="rounded-xl border border-rose-600 px-3 py-1 text-sm text-rose-300"
                onClick={async () => {
                  try {
                    await request(`/api/items/${item.id}`, { method: "DELETE" });
                    setItems((current) => current.filter((entry) => entry.id !== item.id));
                    if (editing?.id === item.id) closeForm();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Item konnte nicht gelöscht werden.");
                  }
                }}
              >
                Löschen
              </button>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-slate-400">Noch keine Items angelegt.</p>}
    </SettingsSection>
  );
}
