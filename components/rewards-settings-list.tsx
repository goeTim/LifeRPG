"use client";

import { useMemo, useState } from "react";
import { RewardForm, rewardToFormValues, RewardFormValues } from "@/components/reward-form";
import { SettingsSection } from "@/components/settings-section";
import { CustomReward } from "@/types/domain";

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Request fehlgeschlagen" }))) as { error?: string };
    throw new Error(payload.error ?? "Request fehlgeschlagen");
  }
  return response.json();
}

export function RewardsSettingsList({ initialRewards }: { initialRewards: CustomReward[] }) {
  const [rewards, setRewards] = useState(initialRewards);
  const [editing, setEditing] = useState<CustomReward | null>(null);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState<RewardFormValues>(rewardToFormValues());
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(() => (editing ? `Reward bearbeiten: ${editing.name}` : "Neuen Reward erstellen"), [editing]);

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setValues(rewardToFormValues());
  };

  return (
    <SettingsSection title="Rewards verwalten" description="Reale Belohnungen, die im Shop gekauft und im Inventar eingelöst werden können.">
      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}
      {!creating && !editing && (
        <button className="btn-primary" onClick={() => setCreating(true)}>
          + Reward hinzufügen
        </button>
      )}
      {(creating || editing) && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <RewardForm
            values={values}
            onChange={setValues}
            onCancel={closeForm}
            submitLabel={editing ? "Reward speichern" : "Reward erstellen"}
            onSubmit={async () => {
              setError(null);
              try {
                if (editing) {
                  const payload = await request(`/api/rewards/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) });
                  setRewards((current) => current.map((reward) => (reward.id === editing.id ? payload.reward : reward)));
                } else {
                  const payload = await request("/api/rewards", { method: "POST", body: JSON.stringify(values) });
                  setRewards((current) => [payload.reward, ...current]);
                }
                closeForm();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Reward konnte nicht gespeichert werden.");
              }
            }}
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {rewards.map((reward) => (
          <article key={reward.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">
                {reward.icon ?? "🎁"} {reward.name}
              </h3>
              <span className="text-sm text-amber-300">{reward.cost_gold} Gold</span>
            </div>
            <p className="mb-3 text-sm text-slate-300">{reward.description || "Keine Beschreibung"}</p>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-cyan-600 px-3 py-1 text-sm text-cyan-300"
                onClick={() => {
                  setCreating(false);
                  setEditing(reward);
                  setValues(rewardToFormValues(reward));
                }}
              >
                Bearbeiten
              </button>
              <button
                className="rounded-xl border border-rose-600 px-3 py-1 text-sm text-rose-300"
                onClick={async () => {
                  try {
                    await request(`/api/rewards/${reward.id}`, { method: "DELETE" });
                    setRewards((current) => current.filter((item) => item.id !== reward.id));
                    if (editing?.id === reward.id) closeForm();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Reward konnte nicht gelöscht werden.");
                  }
                }}
              >
                Löschen
              </button>
            </div>
          </article>
        ))}
      </div>
      {rewards.length === 0 && <p className="text-sm text-slate-400">Noch keine Rewards angelegt.</p>}
    </SettingsSection>
  );
}
