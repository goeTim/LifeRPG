import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const isHabit = formData.get("is_habit") === "on";
  const habitDays = formData.getAll("habit_days").map((day) => Number(day)).filter((day) => !Number.isNaN(day));

  const payload = {
    user_id: user.id,
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "General"),
    xp_value: Number(formData.get("xp_value") ?? 20),
    points_value: Number(formData.get("points_value") ?? 10),
    attribute_bonus: (formData.get("attribute_bonus") || null) as string | null,
    due_date: !isHabit && formData.get("due_date") ? String(formData.get("due_date")) : null,
    is_habit: isHabit,
    habit_days: isHabit ? habitDays : null,
    habit_frequency_per_week: isHabit ? Number(formData.get("habit_frequency_per_week") ?? 1) : null,
    habit_weekly_completions: 0,
    habit_week_start: null
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/tasks", request.url));
}
