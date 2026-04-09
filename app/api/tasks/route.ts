import { NextResponse } from "next/server";
import { ATTRIBUTE_ORDER } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AttributeKey } from "@/types/domain";

function isMissingColumnError(message: string, column: string) {
  return message.toLowerCase().includes(column.toLowerCase()) && message.toLowerCase().includes("column");
}

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
  const habitScheduleMode = String(formData.get("habit_schedule_mode") ?? "frequency");
  const habitDays = formData
    .getAll("habit_days")
    .map((day) => Number(day))
    .filter((day) => !Number.isNaN(day));

  const title = String(formData.get("title") ?? "").trim();
  const xpValue = Number(formData.get("xp_value") ?? 20);
  const pointsValue = Number(formData.get("points_value") ?? 10);
  const attributeBonus = (formData.get("attribute_bonus") || null) as string | null;
  const dueDate = !isHabit && formData.get("due_date") ? String(formData.get("due_date")) : null;
  const skillId = String(formData.get("skill_id") ?? "").trim() || null;
  const skillXpReward = Math.max(0, Number(formData.get("skill_xp_reward") ?? 0));
  const rawHabitFrequency = Number(formData.get("habit_frequency_per_week") ?? 0);
  const parsedHabitFrequency = Number.isFinite(rawHabitFrequency) && rawHabitFrequency > 0 ? rawHabitFrequency : null;
  const scheduleWithDays = habitScheduleMode === "days";
  const normalizedHabitDays = scheduleWithDays ? habitDays : null;
  const normalizedHabitFrequency = scheduleWithDays ? null : parsedHabitFrequency ?? 1;

  if (isHabit && scheduleWithDays && (!normalizedHabitDays || normalizedHabitDays.length === 0)) {
    return NextResponse.json({ error: "Bitte mindestens einen Wochentag für die Gewohnheit auswählen." }, { status: 400 });
  }

  const attributeXpRewards = ATTRIBUTE_ORDER.reduce<Partial<Record<AttributeKey, number>>>((acc, key) => {
    const raw = Number(formData.get(`attr_xp_${key}`) ?? 0);
    if (raw > 0) {
      acc[key] = raw;
    }
    return acc;
  }, {});

  const fullPayload = {
    user_id: user.id,
    title,
    category: "Skill-basiert",
    xp_value: xpValue,
    points_value: pointsValue,
    attribute_bonus: attributeBonus,
    attribute_xp_rewards: attributeXpRewards,
    skill_id: skillId,
    skill_xp_reward: skillXpReward,
    due_date: dueDate,
    is_habit: isHabit,
    habit_days: isHabit ? normalizedHabitDays : null,
    habit_frequency_per_week: isHabit ? normalizedHabitFrequency : null,
    habit_weekly_completions: 0,
    habit_week_start: null
  };

  const { data, error } = await supabase.from("tasks").insert(fullPayload).select("id").single();
  if (!error) {
    return NextResponse.json({ ok: true, id: data.id });
  }

  const missingColumns =
    isMissingColumnError(error.message, "habit_days") ||
    isMissingColumnError(error.message, "is_habit") ||
    isMissingColumnError(error.message, "habit_frequency_per_week") ||
    isMissingColumnError(error.message, "attribute_xp_rewards") ||
    isMissingColumnError(error.message, "skill_id") ||
    isMissingColumnError(error.message, "skill_xp_reward");

  if (missingColumns) {
    return NextResponse.json(
      {
        error:
          "Deine Datenbank hat noch nicht alle Skill-/Gewohnheits-Spalten. Bitte führe das aktuelle supabase/schema.sql inkl. Migration aus und lade danach die Seite neu."
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ error: error.message }, { status: 400 });
}
