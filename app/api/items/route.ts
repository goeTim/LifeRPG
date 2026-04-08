import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ShopItemType } from "@/types/domain";

const ITEM_TYPES: ShopItemType[] = ["consumable", "cosmetic", "title", "unlockable"];

function isItemType(value: string): value is ShopItemType {
  return ITEM_TYPES.includes(value as ShopItemType);
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("shop_items").select("*").or(`user_id.eq.${user.id},user_id.is.null`).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, string | number>;
  const name = String(body.name ?? "").trim();
  const itemType = String(body.item_type ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
  if (!isItemType(itemType)) return NextResponse.json({ error: "Ungültiger item_type." }, { status: 400 });

  const payload = {
    user_id: user.id,
    name,
    description: String(body.description ?? "").trim() || null,
    icon: String(body.icon ?? "").trim() || null,
    cost_gold: Math.max(0, Number(body.cost_gold ?? 0)),
    cost_points: Math.max(0, Number(body.cost_points ?? 0)),
    item_type: itemType,
    rarity: String(body.rarity ?? "").trim() || null,
    color: String(body.color ?? "").trim() || null,
    is_stackable: itemType === "consumable",
    is_consumable: itemType === "consumable"
  };

  const { data, error } = await supabase.from("shop_items").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
