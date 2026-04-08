"use client";

import { useMemo, useState } from "react";
import { SettingsSection } from "@/components/settings-section";
import { SkillCard } from "@/components/skill-card";
import { SkillForm, SkillFormValues, skillToFormValues } from "@/components/skill-form";
import { Skill } from "@/types/domain";

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Request fehlgeschlagen" }))) as { error?: string };
    throw new Error(payload.error ?? "Request fehlgeschlagen");
  }
  return response.json();
}

export function SkillsSettingsList({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState<SkillFormValues>(skillToFormValues());
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(() => (editing ? `Skill bearbeiten: ${editing.name}` : "Neuen Skill erstellen"), [editing]);

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setValues(skillToFormValues());
  };

  return (
    <SettingsSection
      title="Skills verwalten"
      description="Skills sind trainierbare Lebensbereiche. Verknüpfe Tasks und Gewohnheiten mit Skills, um gezielte Progression aufzubauen."
    >
      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}

      {!creating && !editing && (
        <button
          className="btn-primary"
          onClick={() => {
            setCreating(true);
            setValues(skillToFormValues());
          }}
        >
          + Skill hinzufügen
        </button>
      )}

      {(creating || editing) && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <SkillForm
            values={values}
            onChange={setValues}
            submitLabel={editing ? "Skill speichern" : "Skill erstellen"}
            onCancel={closeForm}
            onSubmit={async () => {
              setError(null);
              try {
                if (editing) {
                  const payload = await request(`/api/skills/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) });
                  setSkills((current) => current.map((skill) => (skill.id === editing.id ? payload.skill : skill)));
                } else {
                  const payload = await request("/api/skills", { method: "POST", body: JSON.stringify(values) });
                  setSkills((current) => [payload.skill, ...current]);
                }
                closeForm();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Skill konnte nicht gespeichert werden.");
              }
            }}
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onEdit={(target) => {
              setEditing(target);
              setCreating(false);
              setValues(skillToFormValues(target));
            }}
            onDelete={async (target) => {
              const confirmed = window.confirm(`Skill "${target.name}" wirklich löschen?`);
              if (!confirmed) return;

              setError(null);
              try {
                await request(`/api/skills/${target.id}`, { method: "DELETE" });
                setSkills((current) => current.filter((skill) => skill.id !== target.id));
                if (editing?.id === target.id) {
                  closeForm();
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : "Skill konnte nicht gelöscht werden.");
              }
            }}
          />
        ))}
      </div>

      {skills.length === 0 && <p className="text-sm text-slate-400">Noch keine Skills erstellt. Starte mit deinem ersten trainierbaren Lebensbereich.</p>}
    </SettingsSection>
  );
}
