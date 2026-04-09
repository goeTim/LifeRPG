import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Task } from "@/types/domain";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Partial<Task>;
  const hasHabitDays = Array.isArray(payload.habit_days) && payload.habit_days.length > 0;
  const hasHabitFrequency = typeof payload.habit_frequency_per_week === "number" && payload.habit_frequency_per_week > 0;
  const normalizedHabitDays = hasHabitDays ? payload.habit_days : null;
  const normalizedHabitFrequency = hasHabitDays ? null : hasHabitFrequency ? payload.habit_frequency_per_week : null;
  const normalizedSkillId = payload.skill_id ?? null;
  const normalizedSkillXpReward = normalizedSkillId ? payload.skill_xp_reward : 0;

  const updatePayload = {
    title: payload.title,
    xp_value: payload.xp_value,
    skill_id: normalizedSkillId,
    skill_xp_reward: normalizedSkillXpReward,
    due_date: payload.due_date ?? null,
    is_completed: payload.is_completed,
    is_habit: payload.is_habit,
    habit_frequency_per_week: normalizedHabitFrequency,
    habit_days: normalizedHabitDays
  };

  const sanitizedPayload = Object.fromEntries(Object.entries(updatePayload).filter(([, value]) => value !== undefined));

  const { data: task, error } = await supabase
    .from("tasks")
    .update(sanitizedPayload)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single<Task>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", params.id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
