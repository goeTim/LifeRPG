import { ATTRIBUTE_META } from "@/lib/constants";
import { Skill } from "@/types/domain";
import { SkillProgressBar } from "@/components/skill-progress-bar";

export function SkillCard({ skill, onEdit, onDelete }: { skill: Skill; onEdit: (skill: Skill) => void; onDelete: (skill: Skill) => void }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">
            <span className="mr-2">{skill.icon ?? "🎯"}</span>
            {skill.name}
          </p>
          {skill.description && <p className="text-sm text-slate-300">{skill.description}</p>}
        </div>
        {skill.color && <span className="h-4 w-4 rounded-full border border-slate-700" style={{ backgroundColor: skill.color }} />}
      </div>

      <div className="mb-3 text-xs text-slate-300">
        Primär: <span className="font-semibold">{ATTRIBUTE_META[skill.primary_attribute].label}</span>
        {skill.secondary_attribute && (
          <>
            {" "}· Sekundär: <span className="font-semibold">{ATTRIBUTE_META[skill.secondary_attribute].label}</span>
          </>
        )}
      </div>

      <p className="mb-2 text-sm">Level {skill.level}</p>
      <SkillProgressBar level={skill.level} xp={skill.xp} />

      <div className="mt-3 flex gap-2">
        <button className="rounded-lg border border-slate-600 px-3 py-1 text-sm" onClick={() => onEdit(skill)}>
          Bearbeiten
        </button>
        <button className="rounded-lg border border-rose-700 px-3 py-1 text-sm text-rose-300" onClick={() => onDelete(skill)}>
          Löschen
        </button>
      </div>
    </div>
  );
}
