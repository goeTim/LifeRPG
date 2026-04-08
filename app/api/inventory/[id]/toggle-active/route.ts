import { NextResponse } from "next/server";
import { getInventoryForUser } from "@/lib/inventory-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { InventoryItem } from "@/types/domain";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: entry } = await supabase
    .from("inventory_items")
    .select("*, shop_item:shop_items(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single<InventoryItem>();

  if (!entry) return NextResponse.json({ error: "Eintrag nicht gefunden." }, { status: 404 });
  const type = entry.shop_item?.item_type;
  if (!(type === "cosmetic" || type === "title")) return NextResponse.json({ error: "Nur Cosmetic/Title ist aktivierbar." }, { status: 400 });

  await supabase.from("inventory_items").update({ is_active: !entry.is_active }).eq("id", entry.id);
  return NextResponse.json({ ok: true, inventory: await getInventoryForUser(user.id) });
}
