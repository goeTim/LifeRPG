"use client";

import { Skill } from "@/types/domain";

type SkillPickerProps = {
  skills: Skill[];
  value?: string;
  name?: string;
  label?: string;
  optional?: boolean;
  required?: boolean;
  disabled?: boolean;
};

export function SkillPicker({ skills, value = "", name = "skill_id", label = "Skill", optional = true, required = false, disabled = false }: SkillPickerProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-300">{label}</label>
      <select className="input" name={name} defaultValue={value} required={required} disabled={disabled}>
        {optional && <option value="">Kein Skill zugeordnet</option>}
        {skills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {(skill.icon ?? "🎯") + " " + skill.name}
          </option>
        ))}
      </select>
    </div>
  );
}
