import { NextResponse } from "next/server";
import { consumeInventoryItem, getInventoryForUser } from "@/lib/inventory-service";
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
    .select("*, shop_item:shop_items(*), reward:custom_rewards(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single<InventoryItem>();

  if (!entry) return NextResponse.json({ error: "Eintrag nicht gefunden." }, { status: 404 });

  try {
    await consumeInventoryItem(entry);
    return NextResponse.json({ ok: true, inventory: await getInventoryForUser(user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Aktion fehlgeschlagen" }, { status: 400 });
  }
}
