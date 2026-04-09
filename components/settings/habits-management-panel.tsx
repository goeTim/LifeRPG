"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/settings/empty-state";
import { SearchBar } from "@/components/settings/search-bar";
import { SectionHeader } from "@/components/settings/section-header";
import { Skill, Task } from "@/types/domain";

const weekdayLabel: Record<number, string> = { 0: "So", 1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 5: "Fr", 6: "Sa" };

type HabitScheduleMode = "frequency" | "days";

type EditableHabit = Pick<Task, "id" | "title" | "xp_value" | "skill_id" | "habit_frequency_per_week" | "habit_days" | "skill_xp_reward"> & {
  schedule_mode: HabitScheduleMode;
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
              <span>Planungsmodus</span>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-700 p-2">
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
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              <span>Frequenz pro Woche (wie oft die Gewohnheit erledigt werden soll)</span>
              <input
                className="input disabled:opacity-50"
                type="number"
                min={1}
                value={editing.habit_frequency_per_week ?? 1}
                disabled={editing.schedule_mode !== "frequency"}
                onChange={(e) => setEditing({ ...editing, habit_frequency_per_week: Number(e.target.value) })}
              />
            </label>
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
            <label className="space-y-1 text-xs text-slate-300">
              <span>Zugeordneter Skill (optional)</span>
              <select className="input" value={editing.skill_id ?? ""} onChange={(e) => setEditing({ ...editing, skill_id: e.target.value || null })}>
                <option value="">Kein Skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.icon ?? "🎯"} {skill.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              <span>Wochentage (0=So bis 6=Sa, kommasepariert; leer = jeden Tag)</span>
              <input
                className="input disabled:opacity-50"
                value={(editing.habit_days ?? []).join(",")}
                disabled={editing.schedule_mode !== "days"}
                onChange={(e) => {
                  const days = e.target.value
                    .split(",")
                    .map((value) => Number(value.trim()))
                    .filter((value) => !Number.isNaN(value) && value >= 0 && value <= 6);
                  setEditing({ ...editing, habit_days: days.length ? days : null });
                }}
                placeholder="Tage 0-6, z.B. 1,3,5"
              />
            </label>
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

                  const normalizedPayload = {
                    ...editing,
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
                        skill_id: habit.skill_id,
                        habit_frequency_per_week: habit.habit_frequency_per_week,
                        habit_days: habit.habit_days,
                        skill_xp_reward: habit.skill_xp_reward,
                        schedule_mode: habit.habit_days && habit.habit_days.length > 0 ? "days" : "frequency"
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
