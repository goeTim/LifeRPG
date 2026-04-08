import { NextResponse } from "next/server";
import { getInventoryForUser, purchaseReward, purchaseShopItem } from "@/lib/inventory-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Profile, CustomReward, ShopItem } from "@/types/domain";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { kind?: "reward" | "item"; id?: string };
  if (!body.id || !body.kind) return NextResponse.json({ error: "Ungültiger Kauf." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) return NextResponse.json({ error: "Profil fehlt." }, { status: 404 });

  try {
    const wallet =
      body.kind === "reward"
        ? await (async () => {
            const { data: reward } = await supabase.from("custom_rewards").select("*").eq("id", body.id).eq("user_id", user.id).single<CustomReward>();
            if (!reward) throw new Error("Reward nicht gefunden.");
            return purchaseReward(user.id, reward, profile);
          })()
        : await (async () => {
            const { data: item } = await supabase.from("shop_items").select("*").eq("id", body.id).or(`user_id.eq.${user.id},user_id.is.null`).single<ShopItem>();
            if (!item) throw new Error("Item nicht gefunden.");
            return purchaseShopItem(user.id, item, profile);
          })();

    return NextResponse.json({ ok: true, wallet, inventory: await getInventoryForUser(user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kauf fehlgeschlagen" }, { status: 400 });
  }
}
