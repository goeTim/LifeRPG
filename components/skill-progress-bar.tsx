import { calculateSkillProgress } from "@/lib/leveling";

export function SkillProgressBar({ level, xp }: { level: number; xp: number }) {
  const progress = calculateSkillProgress(level, xp);

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${progress.pct}%` }} />
      </div>
      <p className="text-xs text-slate-400">
        {xp} / {progress.xpNeeded} XP
      </p>
    </div>
  );
}
