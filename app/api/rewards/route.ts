import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("custom_rewards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rewards: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, string | number>;
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });

  const payload = {
    user_id: user.id,
    name,
    description: String(body.description ?? "").trim() || null,
    icon: String(body.icon ?? "").trim() || null,
    cost_gold: Math.max(0, Number(body.cost_gold ?? 0)),
    cost_points: Math.max(0, Number(body.cost_points ?? 0))
  };

  const { data, error } = await supabase.from("custom_rewards").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reward: data });
}
