import { NextResponse } from "next/server";
import { inferNewAchievements, computeStreak } from "@/lib/achievements";
import { applyXpGain } from "@/lib/leveling";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Profile, Task, UserAchievement } from "@/types/domain";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: task } = await supabase.from("tasks").select("*").eq("id", params.id).eq("user_id", user.id).single<Task>();
  if (!task || task.is_completed) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const { error: taskError } = await supabase
    .from("tasks")
    .update({ is_completed: true, completed_at: now })
    .eq("id", params.id)
    .eq("user_id", user.id);
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
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_completed", true),
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
      await supabase.from("user_achievements").insert(defs.map((d) => ({ user_id: user.id, achievement_id: d.id })));
    }
  }

  return NextResponse.json({ ok: true });
}
