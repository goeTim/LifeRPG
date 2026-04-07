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

export function TaskForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="card space-y-3"
      action={async (formData) => {
        setLoading(true);
        await fetch("/api/tasks", { method: "POST", body: formData });
        window.location.reload();
      }}
    >
      <h2 className="text-lg font-semibold">Neues Task</h2>
      <input className="input" name="title" placeholder="Titel" required />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" name="category" placeholder="Kategorie" required />
        <input className="input" name="xp_value" placeholder="XP" type="number" min={5} defaultValue={20} required />
      </div>
      <select className="input" name="attribute_bonus" defaultValue="">
        <option value="">Kein Attribut-Bonus</option>
        {ATTR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Speichern..." : "Task erstellen"}
      </button>
    </form>
  );
}
