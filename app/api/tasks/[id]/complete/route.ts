import { NextResponse } from "next/server";
import { computeStreak, inferNewAchievements } from "@/lib/achievements";
import { applyXpGain } from "@/lib/leveling";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Profile, Task, UserAchievement } from "@/types/domain";

function sameUtcDate(left: string | null, rightIso: string) {
  if (!left) return false;
  const leftDate = new Date(left);
  const rightDate = new Date(rightIso);
  return (
    leftDate.getUTCFullYear() === rightDate.getUTCFullYear() &&
    leftDate.getUTCMonth() === rightDate.getUTCMonth() &&
    leftDate.getUTCDate() === rightDate.getUTCDate()
  );
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: task } = await supabase.from("tasks").select("*").eq("id", params.id).eq("user_id", user.id).single<Task>();
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (task.task_type === "one_time" && task.is_completed) {
    return NextResponse.json({ ok: true });
  }

  if (task.task_type === "habit" && sameUtcDate(task.completed_at, now)) {
    return NextResponse.json({ ok: true, message: "Habit already completed today" });
  }

  const updatePayload =
    task.task_type === "habit"
      ? { completed_at: now }
      : { is_completed: true, completed_at: now };

  const { error: taskError } = await supabase.from("tasks").update(updatePayload).eq("id", params.id).eq("user_id", user.id);
  if (taskError) return NextResponse.json({ error: taskError.message }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) return NextResponse.json({ error: "Profile missing" }, { status: 404 });

  const leveled = applyXpGain(profile.level, profile.xp, task.xp_value);
  const streakStep = computeStreak(profile.last_completed_at, now);

  const attrUpdate = task.attribute_bonus ? { [task.attribute_bonus]: profile[task.attribute_bonus] + 1 } : {};
  const nextStreak = streakStep === null ? profile.streak_count : streakStep === "increment" ? profile.streak_count + 1 : 1;

  await supabase
    .from("profiles")
    .update({
      level: leveled.level,
      xp: leveled.xp,
      streak_count: nextStreak,
      last_completed_at: now,
      ...attrUpdate
    })
    .eq("id", user.id);

  const [{ count }, { data: unlocked }] = await Promise.all([
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("completed_at", "is", null),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievement:achievements(*)")
      .eq("user_id", user.id)
      .returns<UserAchievement[]>()
  ]);

  const codes = inferNewAchievements({
    profile: { ...profile, level: leveled.level, xp: leveled.xp, streak_count: nextStreak },
    completedTasksCount: count ?? 0,
    unlocked: unlocked ?? []
  });

  if (codes.length > 0) {
    const { data: defs } = await supabase.from("achievements").select("id, code").in("code", codes);
    if (defs?.length) {
      await supabase
        .from("user_achievements")
        .insert(defs.map((definition: { id: string }) => ({ user_id: user.id, achievement_id: definition.id })));
    }
  }

  return NextResponse.json({ ok: true });
}
