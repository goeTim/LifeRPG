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
  const payload = {
    user_id: user.id,
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "General"),
    xp_value: Number(formData.get("xp_value") ?? 20),
    attribute_bonus: (formData.get("attribute_bonus") || null) as string | null
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
