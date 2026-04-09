import { NextResponse } from "next/server";
import { inferNewAchievements, computeStreak, habitDueToday } from "@/lib/achievements";
import { applyTaskCompletionRewards } from "@/lib/rewards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Profile, Skill, Task, UserAchievement } from "@/types/domain";

function weekStartISO(date: Date) {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + diff);
  return start.toISOString().slice(0, 10);
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
    return NextResponse.json({ ok: true });
  }

  const now = new Date();
  const nowISO = now.toISOString();

  if (!task.is_habit && task.is_completed) {
    return NextResponse.json({ ok: true });
  }

  if (task.is_habit) {
    if (!habitDueToday(task, nowISO)) {
      return NextResponse.json({ error: "Diese Gewohnheit ist heute nicht fällig." }, { status: 400 });
    }

    const todayISO = nowISO.slice(0, 10);
    if (task.completed_at?.slice(0, 10) === todayISO) {
      return NextResponse.json({ error: "Heute bereits erledigt." }, { status: 400 });
    }

    const currentWeekStart = weekStartISO(now);
    const previousWeekCompletions = task.habit_week_start === currentWeekStart ? task.habit_weekly_completions : 0;
    const weeklyTarget = task.habit_frequency_per_week ?? Math.max(1, task.habit_days?.length ?? 1);

    if (previousWeekCompletions >= weeklyTarget) {
      return NextResponse.json({ error: "Wochenziel bereits erreicht." }, { status: 400 });
    }

    const { error: habitError } = await supabase
      .from("tasks")
      .update({
        completed_at: nowISO,
        habit_week_start: currentWeekStart,
        habit_weekly_completions: previousWeekCompletions + 1
      })
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (habitError) return NextResponse.json({ error: habitError.message }, { status: 400 });
  } else {
    const { error: taskError } = await supabase
      .from("tasks")
      .update({ is_completed: true, completed_at: nowISO })
      .eq("id", params.id)
      .eq("user_id", user.id);
    if (taskError) return NextResponse.json({ error: taskError.message }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) return NextResponse.json({ error: "Profile missing" }, { status: 404 });

  const streakStep = computeStreak(profile.last_completed_at, nowISO);
  const nextStreak = streakStep === null ? profile.streak_count : streakStep === "increment" ? profile.streak_count + 1 : 1;

  const { data: skill } = task.skill_id
    ? await supabase.from("skills").select("*").eq("id", task.skill_id).eq("user_id", user.id).single<Skill>()
    : { data: null as Skill | null };

  const rewards = applyTaskCompletionRewards(profile, task, skill);

  await supabase
    .from("profiles")
    .update({
      ...rewards.profileUpdate,
      streak_count: nextStreak,
      last_completed_at: nowISO
    })
    .eq("id", user.id);

  if (skill && rewards.skillUpdate) {
    await supabase.from("skills").update(rewards.skillUpdate).eq("id", skill.id).eq("user_id", user.id);
  }

  const [{ count }, { data: unlocked }] = await Promise.all([
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("completed_at", "is", null),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievement:achievements(*)")
      .eq("user_id", user.id)
      .returns<UserAchievement[]>()
  ]);

  const codes = inferNewAchievements({
    profile: { ...profile, level: rewards.profileUpdate.level, xp: rewards.profileUpdate.xp, streak_count: nextStreak },
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
