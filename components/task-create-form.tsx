"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttributeKey, TaskType } from "@/types/domain";

const ATTR_OPTIONS: { value: AttributeKey; label: string }[] = [
  { value: "strength", label: "Stärke" },
  { value: "focus", label: "Fokus" },
  { value: "knowledge", label: "Wissen" },
  { value: "endurance", label: "Ausdauer" },
  { value: "charisma", label: "Charisma" }
];

const WEEK_DAYS = [
  { value: "mon", label: "Mo" },
  { value: "tue", label: "Di" },
  { value: "wed", label: "Mi" },
  { value: "thu", label: "Do" },
  { value: "fri", label: "Fr" },
  { value: "sat", label: "Sa" },
  { value: "sun", label: "So" }
];

export function TaskCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>("one_time");

  return (
    <form
      className="card mx-auto w-full max-w-2xl space-y-4"
      action={async (formData) => {
        setLoading(true);
        const response = await fetch("/api/tasks", { method: "POST", body: formData });
        if (response.ok) {
          router.push("/dashboard");
          router.refresh();
          return;
        }
        setLoading(false);
      }}
    >
      <h1 className="text-2xl font-bold">Task / Gewohnheit erstellen</h1>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Titel</span>
          <input className="input" name="title" required placeholder="z. B. 30 Min Workout" />
        </label>
        <label className="space-y-1 text-sm">
          <span>Kategorie</span>
          <input className="input" name="category" required placeholder="Fitness" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span>Typ</span>
          <select className="input" name="task_type" value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)}>
            <option value="one_time">Einmaliges Task</option>
            <option value="habit">Gewohnheit</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>XP</span>
          <input className="input" name="xp_value" type="number" min={5} defaultValue={20} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Attribut-Bonus</span>
          <select className="input" name="attribute_bonus" defaultValue="">
            <option value="">Kein Bonus</option>
            {ATTR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {taskType === "one_time" ? (
        <label className="space-y-1 text-sm">
          <span>Fällig am (optional)</span>
          <input className="input" name="due_date" type="date" />
        </label>
      ) : (
        <>
          <label className="space-y-1 text-sm">
            <span>Wie oft pro Woche?</span>
            <input className="input" name="weekly_frequency" type="number" min={1} max={7} defaultValue={3} />
          </label>

          <fieldset className="space-y-2 text-sm">
            <legend className="mb-1">An welchen Tagen?</legend>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
              {WEEK_DAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 rounded-lg border border-slate-700 px-2 py-2">
                  <input type="checkbox" name="scheduled_days" value={day.value} />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Speichern..." : "Speichern"}
      </button>
    </form>
  );
}
