import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Der Anzeigename muss mindestens 2 Zeichen lang sein." }, { status: 400 });
  }

  const { data, error } = await supabase.from("profiles").update({ name }).eq("id", user.id).select("name").single<{ name: string }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, name: data?.name ?? name, message: "Name erfolgreich gespeichert." });
}
