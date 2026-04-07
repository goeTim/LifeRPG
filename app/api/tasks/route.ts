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
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim();
  const xpValue = Number(formData.get("xp_value") ?? 20);

  if (!title) {
    return NextResponse.json({ error: "Bitte einen Titel angeben." }, { status: 400 });
  }

  if (!Number.isFinite(xpValue) || xpValue <= 0) {
    return NextResponse.json({ error: "XP muss größer als 0 sein." }, { status: 400 });
  }

  const taskType = String(formData.get("task_type") ?? "one_time") === "habit" ? "habit" : "one_time";
  const scheduleMode = String(formData.get("schedule_mode") ?? "days");
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const weeklyFrequencyRaw = String(formData.get("weekly_frequency") ?? "").trim();
  const weeklyFrequency = weeklyFrequencyRaw ? Number(weeklyFrequencyRaw) : null;
  const scheduledDays = formData.getAll("scheduled_days").map(String);

  if (taskType === "habit") {
    if (scheduleMode === "days" && scheduledDays.length === 0) {
      return NextResponse.json({ error: "Bitte mindestens einen Wochentag auswählen." }, { status: 400 });
    }

    if (scheduleMode === "frequency") {
      if (!weeklyFrequency || weeklyFrequency < 1 || weeklyFrequency > 7) {
        return NextResponse.json({ error: "Die Anzahl pro Woche muss zwischen 1 und 7 liegen." }, { status: 400 });
      }
    }
  }

  const payload = {
    user_id: user.id,
    title,
    category,
    xp_value: xpValue,
    attribute_bonus: (formData.get("attribute_bonus") || null) as string | null,
    task_type: taskType,
    due_date: taskType === "one_time" && dueDate ? dueDate : null,
    weekly_frequency: taskType === "habit" && scheduleMode === "frequency" ? weeklyFrequency : null,
    scheduled_days: taskType === "habit" && scheduleMode === "days" ? scheduledDays : []
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) {
    const message = error.message.includes("task_type")
      ? "DB-Schema ist veraltet. Bitte das aktualisierte supabase/schema.sql erneut ausführen."
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
