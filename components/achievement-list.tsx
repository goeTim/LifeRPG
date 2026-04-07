import { UserAchievement } from "@/types/domain";

type Props = { achievements: UserAchievement[] };

export function AchievementList({ achievements }: Props) {
  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-semibold">Achievements</h2>
      {achievements.length === 0 && <p className="text-sm text-slate-400">Noch keine Achievements freigeschaltet.</p>}
      {achievements.map((entry) => (
        <div key={entry.achievement_id} className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
          <p className="font-medium text-violet-100">{entry.achievement.title}</p>
          <p className="text-sm text-slate-300">{entry.achievement.description}</p>
        </div>
      ))}
    </div>
  );
}
