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

  const body = (await request.json().catch(() => ({}))) as { confirmation?: string };
  if (body.confirmation?.trim().toUpperCase() !== "RESET") {
    return NextResponse.json({ error: 'Zur Bestätigung muss "RESET" gesendet werden.' }, { status: 400 });
  }

  const profileUpdate = {
    level: 1,
    xp: 0,
    gold: 0,
    points: 0,
    streak_count: 0,
    last_completed_at: null,
    strength: 1,
    focus: 1,
    knowledge: 1,
    endurance: 1,
    discipline: 1,
    charisma: 1,
    strength_level: 1,
    strength_xp: 0,
    focus_level: 1,
    focus_xp: 0,
    knowledge_level: 1,
    knowledge_xp: 0,
    endurance_level: 1,
    endurance_xp: 0,
    discipline_level: 1,
    discipline_xp: 0,
    charisma_level: 1,
    charisma_xp: 0
  };

  const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: skillsError } = await supabase.from("skills").update({ level: 1, xp: 0 }).eq("user_id", user.id);
  if (skillsError) {
    return NextResponse.json({ error: skillsError.message }, { status: 400 });
  }

  const { error: inventoryError } = await supabase.from("inventory_items").delete().eq("user_id", user.id);
  if (inventoryError) {
    return NextResponse.json({ error: inventoryError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Charakterfortschritt wurde zurückgesetzt. Tasks und Gewohnheiten bleiben erhalten."
  });
}
