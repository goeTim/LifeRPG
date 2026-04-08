import { NextResponse } from "next/server";
import { ATTRIBUTE_ORDER } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AttributeKey } from "@/types/domain";

function isAttribute(value: string | null): value is AttributeKey {
  return !!value && ATTRIBUTE_ORDER.includes(value as AttributeKey);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, string | null>;
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim() || null;
  const icon = String(body.icon ?? "").trim() || null;
  const color = String(body.color ?? "").trim() || null;
  const primaryAttributeRaw = String(body.primary_attribute ?? "").trim() || null;
  const secondaryAttributeRaw = String(body.secondary_attribute ?? "").trim() || null;

  if (!name) return NextResponse.json({ error: "Skill-Name ist erforderlich." }, { status: 400 });
  if (!isAttribute(primaryAttributeRaw)) return NextResponse.json({ error: "Primäres Attribut ist ungültig." }, { status: 400 });
  if (secondaryAttributeRaw && !isAttribute(secondaryAttributeRaw)) {
    return NextResponse.json({ error: "Sekundäres Attribut ist ungültig." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("skills")
    .update({
      name,
      description,
      icon,
      color,
      primary_attribute: primaryAttributeRaw,
      secondary_attribute: secondaryAttributeRaw
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ skill: data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("skills").delete().eq("id", params.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
