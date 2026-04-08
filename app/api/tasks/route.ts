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
  const habitDays = formData
    .getAll("habit_days")
    .map((day) => Number(day))
    .filter((day) => !Number.isNaN(day));

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim() || "General";
  const xpValue = Number(formData.get("xp_value") ?? 20);
  const pointsValue = Number(formData.get("points_value") ?? 10);
  const attributeBonus = (formData.get("attribute_bonus") || null) as string | null;
  const dueDate = !isHabit && formData.get("due_date") ? String(formData.get("due_date")) : null;

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
    category,
    xp_value: xpValue,
    points_value: pointsValue,
    attribute_bonus: attributeBonus,
    attribute_xp_rewards: attributeXpRewards,
    due_date: dueDate,
    is_habit: isHabit,
    habit_days: isHabit ? habitDays : null,
    habit_frequency_per_week: isHabit ? Number(formData.get("habit_frequency_per_week") ?? 1) : null,
    habit_weekly_completions: 0,
    habit_week_start: null
  };

  const { data, error } = await supabase.from("tasks").insert(fullPayload).select("id").single();
  if (!error) {
    return NextResponse.json({ ok: true, id: data.id });
  }

  const missingHabitColumns =
    isMissingColumnError(error.message, "habit_days") ||
    isMissingColumnError(error.message, "is_habit") ||
    isMissingColumnError(error.message, "habit_frequency_per_week") ||
    isMissingColumnError(error.message, "attribute_xp_rewards");

  if (isHabit && missingHabitColumns) {
    return NextResponse.json(
      {
        error:
          "Deine Datenbank hat noch keine Gewohnheits-/Attribut-Spalten (z. B. habit_days, attribute_xp_rewards). Bitte führe supabase/schema.sql erneut aus und lade danach die Seite neu."
      },
      { status: 400 }
    );
  }

  const missingPointsColumn = isMissingColumnError(error.message, "points_value");
  if (missingHabitColumns || missingPointsColumn) {
    const legacyPayload = {
      user_id: user.id,
      title,
      category,
      xp_value: xpValue,
      attribute_bonus: attributeBonus,
      due_date: dueDate
    };

    const { data: legacyData, error: legacyError } = await supabase.from("tasks").insert(legacyPayload).select("id").single();
    if (!legacyError) {
      return NextResponse.json({ ok: true, id: legacyData.id, warning: "legacy_schema" });
    }

    return NextResponse.json({ error: legacyError.message }, { status: 400 });
  }

  return NextResponse.json({ error: error.message }, { status: 400 });
}
