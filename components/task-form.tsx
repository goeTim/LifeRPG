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
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 0, label: "So" }
];

export function TaskForm() {
  const [loading, setLoading] = useState(false);
  const [isHabit, setIsHabit] = useState(false);

  return (
    <form
      className="card space-y-3"
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
        Als Gewohnheit erstellen
      </label>

      <input className="input" name="title" placeholder="Titel" required />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" name="category" placeholder="Kategorie" required />
        <input className="input" name="xp_value" placeholder="XP" type="number" min={5} defaultValue={20} required />
      </div>

      <input className="input" name="points_value" placeholder="Punkte" type="number" min={0} defaultValue={10} required />

      {!isHabit && (
        <input className="input" name="due_date" type="date" placeholder="Fällig am (optional)" />
      )}

      {isHabit && (
        <>
          <input
            className="input"
            name="habit_frequency_per_week"
            type="number"
            min={1}
            max={14}
            defaultValue={3}
            required
            placeholder="Wie oft pro Woche?"
          />
          <div className="rounded-xl border border-slate-700 p-3">
            <p className="mb-2 text-sm text-slate-300">Bestimmte Tage (optional)</p>
            <div className="flex flex-wrap gap-2">
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

      <select className="input" name="attribute_bonus" defaultValue="">
        <option value="">Kein Attribut-Bonus</option>
        {ATTR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Speichern..." : isHabit ? "Gewohnheit erstellen" : "Task erstellen"}
      </button>
    </form>
  );
}
