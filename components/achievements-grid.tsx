import { ACHIEVEMENT_DEFINITIONS } from "@/lib/constants";
import { AchievementCode, UserAchievement } from "@/types/domain";

type Props = {
  unlocked: UserAchievement[];
};

export function AchievementsGrid({ unlocked }: Props) {
  const unlockedCodes = new Set(unlocked.map((item) => item.achievement.code));

  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-semibold">Achievements</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(ACHIEVEMENT_DEFINITIONS) as [AchievementCode, (typeof ACHIEVEMENT_DEFINITIONS)[AchievementCode]][]).map(
          ([code, def]) => {
            const isUnlocked = unlockedCodes.has(code);
            return (
              <div
                key={code}
                className={`rounded-xl border p-3 ${
                  isUnlocked ? "border-violet-500/40 bg-violet-500/10" : "border-slate-700 bg-slate-900/40 opacity-60"
                }`}
              >
                <p className="text-2xl">{def.icon}</p>
                <p className="mt-1 font-semibold">{def.title}</p>
                <p className="text-sm text-slate-300">{def.description}</p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
