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
  const taskType = String(formData.get("task_type") ?? "one_time");
  const dueDate = formData.get("due_date");
  const weeklyFrequency = formData.get("weekly_frequency");
  const scheduledDays = formData.getAll("scheduled_days").map(String);

  const payload = {
    user_id: user.id,
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "General"),
    xp_value: Number(formData.get("xp_value") ?? 20),
    attribute_bonus: (formData.get("attribute_bonus") || null) as string | null,
    task_type: taskType === "habit" ? "habit" : "one_time",
    due_date: taskType === "one_time" && dueDate ? String(dueDate) : null,
    weekly_frequency: taskType === "habit" && weeklyFrequency ? Number(weeklyFrequency) : null,
    scheduled_days: taskType === "habit" ? scheduledDays : []
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
