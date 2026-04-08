"use client";

import { useState } from "react";
import { AttributeKey } from "@/types/domain";

const ATTR_OPTIONS: { value: AttributeKey; label: string }[] = [
  { value: "strength", label: "Stärke" },
  { value: "focus", label: "Fokus" },
  { value: "knowledge", label: "Wissen" },
  { value: "endurance", label: "Ausdauer" },
  { value: "charisma", label: "Charisma" }
];

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
  { value: 0, label: "Sonntag" }
];

export function TaskForm() {
  const [loading, setLoading] = useState(false);
  const [isHabit, setIsHabit] = useState(false);

  return (
    <form
      className="card space-y-4"
      action={async (formData) => {
        setLoading(true);
        await fetch("/api/tasks", { method: "POST", body: formData });
        window.location.reload();
      }}
    >
      <h2 className="text-lg font-semibold">Neues {isHabit ? "Gewohnheit" : "Task"}</h2>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          name="is_habit"
          checked={isHabit}
          onChange={(event) => setIsHabit(event.target.checked)}
        />
        Als Gewohnheit erstellen (wiederkehrend)
      </label>

      <div className="space-y-1">
        <label className="text-sm text-slate-300">Titel</label>
        <input className="input" name="title" placeholder="z. B. 30 Min Workout" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Kategorie</label>
          <input className="input" name="category" placeholder="Fitness, Lernen, ..." required />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-300">XP Belohnung</label>
          <input className="input" name="xp_value" placeholder="XP" type="number" min={5} defaultValue={20} required />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-300">Punkte Belohnung</label>
        <input className="input" name="points_value" placeholder="Punkte" type="number" min={0} defaultValue={10} required />
      </div>

      {!isHabit && (
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Fälligkeitsdatum (optional)</label>
          <input className="input" name="due_date" type="date" placeholder="Kein Datum = jederzeit" />
        </div>
      )}

      {isHabit && (
        <>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Wie oft pro Woche?</label>
            <input
              className="input"
              name="habit_frequency_per_week"
              type="number"
              min={1}
              max={14}
              defaultValue={3}
              required
              placeholder="z. B. 3"
            />
          </div>

          <div className="rounded-xl border border-slate-700 p-3">
            <p className="mb-2 text-sm text-slate-300">An welchen Tagen? (optional)</p>
            <p className="mb-3 text-xs text-slate-400">Wenn leer, ist die Gewohnheit an jedem Tag machbar.</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {WEEKDAY_OPTIONS.map((day) => (
                <label key={day.value} className="rounded-lg border border-slate-700 px-2 py-1 text-sm">
                  <input className="mr-2" type="checkbox" name="habit_days" value={day.value} />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-1">
        <label className="text-sm text-slate-300">Attribut-Bonus (optional)</label>
        <select className="input" name="attribute_bonus" defaultValue="">
          <option value="">Kein Attribut-Bonus</option>
          {ATTR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Speichern..." : isHabit ? "Gewohnheit erstellen" : "Task erstellen"}
      </button>
    </form>
  );
}
