import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ShopItemType } from "@/types/domain";

const ITEM_TYPES: ShopItemType[] = ["consumable", "cosmetic", "title", "unlockable"];

function isItemType(value: string): value is ShopItemType {
  return ITEM_TYPES.includes(value as ShopItemType);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const { data, error } = await supabase
    .from("shop_items")
    .update({
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
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase.from("inventory_items").delete().eq("user_id", user.id).eq("shop_item_id", params.id);
  const { error } = await supabase.from("shop_items").delete().eq("id", params.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
