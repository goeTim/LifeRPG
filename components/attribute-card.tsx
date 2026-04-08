import { ProgressBar } from "@/components/progress-bar";

type Props = {
  label: string;
  description: string;
  level: number;
  xp: number;
  xpNeeded: number;
  xpRemaining: number;
  progress: number;
};

export function AttributeCard({ label, description, level, xp, xpNeeded, xpRemaining, progress }: Props) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="rounded-lg bg-slate-800 px-2 py-1 text-sm">Lvl {level}</p>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
      <ProgressBar value={progress} />
      <p className="text-sm text-slate-300">
        {xp} / {xpNeeded} XP · noch {xpRemaining} XP bis Level {level + 1}
      </p>
    </div>
  );
}
