"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/settings/empty-state";
import { SearchBar } from "@/components/settings/search-bar";
import { SectionHeader } from "@/components/settings/section-header";
import { ATTRIBUTE_META, ATTRIBUTE_ORDER } from "@/lib/constants";
import { AttributeKey, Skill, Task } from "@/types/domain";

const weekdayLabel: Record<number, string> = { 0: "So", 1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 5: "Fr", 6: "Sa" };
const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 0, label: "So" }
];

type HabitScheduleMode = "frequency" | "days";

type EditableHabit = Pick<Task, "id" | "title" | "xp_value" | "points_value" | "skill_id" | "habit_frequency_per_week" | "habit_days" | "skill_xp_reward"> & {
  attribute_xp_rewards: Partial<Record<AttributeKey, number>> | null;
  schedule_mode: HabitScheduleMode;
  skill_enabled: boolean;
  skill_xp_enabled: boolean;
  attribute_xp_enabled: boolean;
};

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Request fehlgeschlagen" }))) as { error?: string };
    throw new Error(payload.error ?? "Request fehlgeschlagen");
  }
  return response.json();
}

export function HabitsManagementPanel({ initialHabits, skills }: { initialHabits: Task[]; skills: Skill[] }) {
  const [habits, setHabits] = useState(initialHabits);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditableHabit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const skillNameById = useMemo(() => Object.fromEntries(skills.map((skill) => [skill.id, `${skill.icon ?? "🎯"} ${skill.name}`])), [skills]);

  const filtered = useMemo(
    () => habits.filter((habit) => habit.title.toLowerCase().includes(query.toLowerCase())),
    [habits, query]
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Gewohnheiten verwalten"
        description="Wiederkehrende Routinen mit Frequenz und Skill-Bezug pflegen."
        action={<span className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300">{habits.length} aktiv</span>}
      />

      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}
      <SearchBar value={query} onChange={setQuery} placeholder="Gewohnheiten durchsuchen" />

      {editing && (
        <div className="space-y-3 rounded-xl border border-cyan-700/40 bg-cyan-900/10 p-4">
          <h3 className="font-semibold">Gewohnheit bearbeiten</h3>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-300">
              <span>Name der Gewohnheit</span>
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              <span>Globale XP (allgemeine Account-XP bei Abschluss)</span>
              <input
                className="input"
                type="number"
                min={0}
                value={editing.xp_value}
                onChange={(e) => setEditing({ ...editing, xp_value: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              <span>Punktebelohnung</span>
              <input
                className="input"
                type="number"
                min={0}
                value={editing.points_value}
                onChange={(e) => setEditing({ ...editing, points_value: Number(e.target.value) })}
              />
            </label>
            <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/40 p-3 md:col-span-2">
              <span className="text-xs text-slate-300">Planungsmodus</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-200">
                  <input
                    className="mr-2"
                    type="radio"
                    checked={editing.schedule_mode === "frequency"}
                    onChange={() =>
                      setEditing({
                        ...editing,
                        schedule_mode: "frequency",
                        habit_days: null,
                        habit_frequency_per_week: editing.habit_frequency_per_week ?? 3
                      })
                    }
                  />
                  Wochenziel
                </label>
                <label className="text-xs text-slate-200">
                  <input
                    className="mr-2"
                    type="radio"
                    checked={editing.schedule_mode === "days"}
                    onChange={() =>
                      setEditing({
                        ...editing,
                        schedule_mode: "days",
                        habit_frequency_per_week: null,
                        habit_days: editing.habit_days ?? []
                      })
                    }
                  />
                  Wochentage
                </label>
              </div>
              <label className="space-y-1 text-xs text-slate-300">
                <span>Wie oft pro Woche?</span>
                <input
                  className="input disabled:opacity-50"
                  type="number"
                  min={1}
                  value={editing.habit_frequency_per_week ?? 1}
                  disabled={editing.schedule_mode !== "frequency"}
                  onChange={(e) => setEditing({ ...editing, habit_frequency_per_week: Number(e.target.value) })}
                />
              </label>
              <div className="space-y-1 text-xs text-slate-300">
                <span>Spezifische Wochentage</span>
                <div className={`grid grid-cols-4 gap-2 ${editing.schedule_mode !== "days" ? "pointer-events-none opacity-50" : ""}`}>
                  {WEEKDAY_OPTIONS.map((day) => {
                    const checked = (editing.habit_days ?? []).includes(day.value);
                    return (
                      <label key={day.value} className="rounded-md border border-slate-700 px-2 py-1 text-center text-xs text-slate-200">
                        <input
                          className="mr-1"
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const current = editing.habit_days ?? [];
                            const next = event.target.checked ? [...current, day.value] : current.filter((value) => value !== day.value);
                            const uniqueSorted = Array.from(new Set(next)).sort((a, b) => a - b);
                            setEditing({ ...editing, habit_days: uniqueSorted.length ? uniqueSorted : null });
                          }}
                        />
                        {day.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/40 p-3 md:col-span-2">
              <p className="text-xs text-slate-300">Skill</p>
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={editing.skill_enabled}
                  onChange={(e) => {
                    if (e.target.checked && skills.length === 0) {
                      setError("Du hast noch keine Skills erstellt. Bitte lege zuerst einen Skill an.");
                      return;
                    }
                    setEditing({
                      ...editing,
                      skill_enabled: e.target.checked,
                      skill_id: e.target.checked ? editing.skill_id ?? skills[0]?.id ?? null : null,
                      skill_xp_enabled: e.target.checked ? editing.skill_xp_enabled : false,
                      skill_xp_reward: e.target.checked ? editing.skill_xp_reward : 0
                    });
                  }}
                />
                Skill-Zuordnung aktivieren
              </label>
              <div className={editing.skill_enabled ? "" : "pointer-events-none opacity-50"}>
                <label className="space-y-1 text-xs text-slate-300">
                  <span>Zugeordneter Skill</span>
                  <select className="input" value={editing.skill_id ?? ""} onChange={(e) => setEditing({ ...editing, skill_id: e.target.value || null })}>
                    <option value="" disabled>
                      Skill auswählen
                    </option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.icon ?? "🎯"} {skill.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={editing.skill_xp_enabled}
                  onChange={(e) => {
                    if (e.target.checked && !editing.skill_enabled) {
                      setError("Aktiviere zuerst die Skill-Zuordnung.");
                      return;
                    }
                    setEditing({ ...editing, skill_xp_enabled: e.target.checked, skill_xp_reward: e.target.checked ? editing.skill_xp_reward : 0 });
                  }}
                />
                Zusätzliche Skill-XP aktivieren
              </label>
              <div className={editing.skill_xp_enabled && editing.skill_enabled ? "" : "pointer-events-none opacity-50"}>
                <label className="space-y-1 text-xs text-slate-300">
                  <span>Skill-XP (zusätzliche XP für den gewählten Skill)</span>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={editing.skill_xp_reward}
                    onChange={(e) => setEditing({ ...editing, skill_xp_reward: Number(e.target.value) })}
                    placeholder="Skill-XP"
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/40 p-3 md:col-span-2">
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={editing.attribute_xp_enabled}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      attribute_xp_enabled: e.target.checked,
                      attribute_xp_rewards: e.target.checked ? editing.attribute_xp_rewards ?? {} : null
                    })
                  }
                />
                Attribut-XP aktivieren
              </label>
              <div className={`grid grid-cols-2 gap-2 ${editing.attribute_xp_enabled ? "" : "pointer-events-none opacity-50"}`}>
                {ATTRIBUTE_ORDER.map((key) => (
                  <label key={key} className="text-xs text-slate-300">
                    {ATTRIBUTE_META[key].label}
                    <input
                      className="input mt-1"
                      type="number"
                      min={0}
                      step={5}
                      value={editing.attribute_xp_rewards?.[key] ?? 0}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          attribute_xp_rewards: {
                            ...(editing.attribute_xp_rewards ?? {}),
                            [key]: Number(e.target.value)
                          }
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  setError(null);
                  if (editing.schedule_mode === "days" && (!editing.habit_days || editing.habit_days.length === 0)) {
                    setError("Bei Modus 'Wochentage' musst du mindestens einen Tag setzen.");
                    return;
                  }
                  if (editing.skill_enabled && !editing.skill_id) {
                    setError("Bitte wähle einen Skill aus, wenn die Skill-Zuordnung aktiv ist.");
                    return;
                  }

                  const normalizedPayload = {
                    ...editing,
                    skill_id: editing.skill_enabled ? editing.skill_id : null,
                    skill_xp_reward: editing.skill_enabled && editing.skill_xp_enabled ? editing.skill_xp_reward : 0,
                    attribute_xp_rewards: editing.attribute_xp_enabled ? editing.attribute_xp_rewards ?? {} : {},
                    habit_frequency_per_week: editing.schedule_mode === "frequency" ? editing.habit_frequency_per_week ?? 3 : null,
                    habit_days: editing.schedule_mode === "days" ? editing.habit_days ?? [] : null
                  };
                  const payload = await request(`/api/tasks/${editing.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ ...normalizedPayload, is_habit: true })
                  });
                  setHabits((current) => current.map((habit) => (habit.id === editing.id ? payload.task : habit)));
                  setEditing(null);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Gewohnheit konnte nicht gespeichert werden.");
                }
              }}
            >
              Änderungen speichern
            </button>
            <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={() => setEditing(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="Keine Gewohnheiten aktiv" description="Lege im Bereich Tasks eine Gewohnheit an oder passe deine Suche an." />
      ) : (
        <div className="space-y-2">
          {filtered.map((habit) => (
            <article key={habit.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{habit.title}</h3>
                  <p className="text-xs text-slate-400">
                    {habit.xp_value} globale XP ·{" "}
                    {habit.habit_days && habit.habit_days.length
                      ? `Modus: Wochentage (${habit.habit_days.length} Tage)`
                      : `Modus: Wochenziel (${habit.habit_frequency_per_week ?? 1}/Woche)`}{" "}
                    · Status: aktiv
                  </p>
                  <p className="text-xs text-cyan-300">Skill: {habit.skill_id ? skillNameById[habit.skill_id] ?? "(gelöscht)" : "nicht zugeordnet"}</p>
                  <p className="text-xs text-violet-300">
                    Tage: {(habit.habit_days ?? []).length ? (habit.habit_days ?? []).map((day) => weekdayLabel[day] ?? day).join(", ") : "jeden Tag"}
                  </p>
                  <p className="text-xs text-slate-400">Streak/Fortschritt: {habit.habit_weekly_completions} diese Woche</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl border border-cyan-700 px-3 py-1 text-sm text-cyan-300"
                    onClick={() =>
                      setEditing({
                        id: habit.id,
                        title: habit.title,
                        xp_value: habit.xp_value,
                        points_value: habit.points_value,
                        skill_id: habit.skill_id,
                        habit_frequency_per_week: habit.habit_frequency_per_week,
                        habit_days: habit.habit_days,
                        skill_xp_reward: habit.skill_xp_reward,
                        attribute_xp_rewards: habit.attribute_xp_rewards,
                        schedule_mode: habit.habit_days && habit.habit_days.length > 0 ? "days" : "frequency",
                        skill_enabled: Boolean(habit.skill_id),
                        skill_xp_enabled: Boolean(habit.skill_id) && habit.skill_xp_reward > 0,
                        attribute_xp_enabled: Boolean(habit.attribute_xp_rewards && Object.keys(habit.attribute_xp_rewards).length > 0)
                      })
                    }
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="rounded-xl border border-rose-700 px-3 py-1 text-sm text-rose-300"
                    onClick={async () => {
                      try {
                        setError(null);
                        await request(`/api/tasks/${habit.id}`, { method: "DELETE" });
                        setHabits((current) => current.filter((entry) => entry.id !== habit.id));
                        if (editing?.id === habit.id) setEditing(null);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Gewohnheit konnte nicht gelöscht werden.");
                      }
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
