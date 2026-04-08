import { GoldDisplay } from "@/components/gold-display";
import { ProgressBar } from "@/components/progress-bar";

type Props = {
  avatar: string;
  name: string;
  level: number;
  xp: number;
  xpNeeded: number;
  xpPct: number;
  gold: number;
  title: string;
};

export function ProfileHeader({ avatar, name, level, xp, xpNeeded, xpPct, gold, title }: Props) {
  return (
    <div className="card space-y-4 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/40 bg-violet-500/10 text-3xl">{avatar}</div>
          <div>
            <p className="text-sm uppercase tracking-wider text-violet-300">{title}</p>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-slate-300">Global Level {level}</p>
          </div>
        </div>
        <GoldDisplay amount={gold} />
      </div>
      <div className="space-y-2">
        <ProgressBar value={xpPct} />
        <p className="text-sm text-slate-300">
          {xp} / {xpNeeded} XP bis zum nächsten globalen Level
        </p>
      </div>
    </div>
  );
}
