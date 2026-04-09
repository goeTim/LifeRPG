"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SkillPicker } from "@/components/skill-picker";
import { ATTRIBUTE_META, ATTRIBUTE_ORDER } from "@/lib/constants";
import { AttributeKey, Skill } from "@/types/domain";
import { DisabledFieldWrapper } from "@/components/tasks/disabled-field-wrapper";
import { FormSection } from "@/components/tasks/form-section";
import { OptionalFieldToggle } from "@/components/tasks/optional-field-toggle";

const ATTR_OPTIONS: { value: AttributeKey; label: string }[] = ATTRIBUTE_ORDER.map((key) => ({ value: key, label: ATTRIBUTE_META[key].label }));

export function TaskCreateForm({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillEnabled, setSkillEnabled] = useState(false);
  const [skillXpEnabled, setSkillXpEnabled] = useState(false);
  const [dueDateEnabled, setDueDateEnabled] = useState(false);
  const [attributeXpEnabled, setAttributeXpEnabled] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const response = await fetch("/api/tasks", { method: "POST", body: formData });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({ error: "Task konnte nicht erstellt werden." }))) as { error?: string };
          setError(payload.error ?? "Task konnte nicht erstellt werden.");
          setLoading(false);
          return;
        }

        event.currentTarget.reset();
        setSkillEnabled(false);
        setSkillXpEnabled(false);
        setDueDateEnabled(false);
        setAttributeXpEnabled(false);
        setLoading(false);
        router.refresh();
      }}
    >
      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}

      <FormSection title="Basisdaten" description="Pflichtfelder für einen neuen Task.">
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Titel</label>
          <input className="input" name="title" placeholder="z. B. 30 Min Workout" required />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Globale XP</label>
            <input className="input" name="xp_value" placeholder="XP" type="number" min={5} defaultValue={20} required />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Punkte Belohnung</label>
            <input className="input" name="points_value" placeholder="Punkte" type="number" min={0} defaultValue={10} required />
          </div>
        </div>
      </FormSection>

      <FormSection title="Optionale Einstellungen">
        <OptionalFieldToggle
          id="task-skill-toggle"
          checked={skillEnabled}
          onChange={setSkillEnabled}
          label="Skill-Zuordnung aktivieren"
          hint="Ordne diesen Task einem trainierten Skill zu."
        >
          <DisabledFieldWrapper enabled={skillEnabled}>
            <SkillPicker skills={skills} label="Trainierter Skill" />
          </DisabledFieldWrapper>
        </OptionalFieldToggle>

        <OptionalFieldToggle
          id="task-skill-xp-toggle"
          checked={skillXpEnabled}
          onChange={setSkillXpEnabled}
          label="Zusätzliche Skill-XP aktivieren"
          hint="Verteile extra XP auf den zugeordneten Skill."
        >
          <DisabledFieldWrapper enabled={skillXpEnabled}>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Skill-XP Belohnung</label>
              <input className="input" name="skill_xp_reward" placeholder="0" type="number" min={0} step={5} defaultValue={0} />
            </div>
          </DisabledFieldWrapper>
        </OptionalFieldToggle>

        <OptionalFieldToggle
          id="task-due-date-toggle"
          checked={dueDateEnabled}
          onChange={setDueDateEnabled}
          label="Fälligkeitsdatum aktivieren"
          hint="Wenn deaktiviert, ist der Task jederzeit erledigbar."
        >
          <DisabledFieldWrapper enabled={dueDateEnabled}>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Fälligkeitsdatum</label>
              <input className="input" name="due_date" type="date" />
            </div>
          </DisabledFieldWrapper>
        </OptionalFieldToggle>

        <OptionalFieldToggle
          id="task-attr-xp-toggle"
          checked={attributeXpEnabled}
          onChange={setAttributeXpEnabled}
          label="Attribut-XP aktivieren"
          hint="Vergib optional Attribut-XP auf mehrere Attribute."
        >
          <DisabledFieldWrapper enabled={attributeXpEnabled}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ATTR_OPTIONS.map((opt) => (
                <label key={opt.value} className="text-xs text-slate-300">
                  {opt.label}
                  <input className="input mt-1" type="number" min={0} step={5} name={`attr_xp_${opt.value}`} defaultValue={0} />
                </label>
              ))}
            </div>
          </DisabledFieldWrapper>
        </OptionalFieldToggle>
      </FormSection>

      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Speichern..." : "Task erstellen"}
      </button>
    </form>
  );
}
