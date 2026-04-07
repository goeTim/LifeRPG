import { AchievementCode, Profile, Task, UserAchievement } from "@/types/domain";

export function inferNewAchievements(params: {
  profile: Profile;
  completedTasksCount: number;
  unlocked: UserAchievement[];
}): AchievementCode[] {
  const { profile, completedTasksCount, unlocked } = params;
  const owned = new Set(unlocked.map((entry) => entry.achievement.code));
  const toUnlock: AchievementCode[] = [];

  if (!owned.has("first_task") && completedTasksCount >= 1) toUnlock.push("first_task");
  if (!owned.has("five_tasks") && completedTasksCount >= 5) toUnlock.push("five_tasks");
  if (!owned.has("level_5") && profile.level >= 5) toUnlock.push("level_5");
  if (!owned.has("three_day_streak") && profile.streak_count >= 3) toUnlock.push("three_day_streak");

  return toUnlock;
}

export function computeStreak(previous: string | null, nowISO: string) {
  if (!previous) return 1;
  const prev = new Date(previous);
  const now = new Date(nowISO);
  const dayMs = 1000 * 60 * 60 * 24;
  const diff = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate())) /
      dayMs
  );

  if (diff === 0) return null;
  if (diff === 1) return "increment";
  return "reset";
}

function sameUtcDate(left: string | null, rightDate: Date) {
  if (!left) return false;
  const leftDate = new Date(left);
  return (
    leftDate.getUTCFullYear() === rightDate.getUTCFullYear() &&
    leftDate.getUTCMonth() === rightDate.getUTCMonth() &&
    leftDate.getUTCDate() === rightDate.getUTCDate()
  );
}

export function todayTasks(tasks: Task[]) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekday = now
    .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
    .toLowerCase();

  return tasks.filter((task) => {
    if (task.task_type === "habit") {
      if (sameUtcDate(task.completed_at, now)) return false;
      if (task.scheduled_days.length === 0) return true;
      return task.scheduled_days.includes(weekday);
    }

    if (task.is_completed) return false;
    return !task.due_date || task.due_date === today;
  });
}
