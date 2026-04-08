import { createSupabaseServerClient } from "@/lib/supabase-server";
import { canAfford, deductWallet, isItemConsumable, isItemStackable } from "@/lib/inventory";
import { CustomReward, InventoryItem, Profile, ShopItem } from "@/types/domain";

export async function getInventoryForUser(userId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("*, shop_item:shop_items(*), reward:custom_rewards(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .returns<InventoryItem[]>();
  return data ?? [];
}

export async function purchaseReward(userId: string, reward: CustomReward, profile: Profile) {
  const supabase = createSupabaseServerClient();
  if (!canAfford({ gold: profile.gold ?? 0, points: profile.points ?? 0, costGold: reward.cost_gold, costPoints: reward.cost_points })) {
    throw new Error("Nicht genug Gold/Punkte.");
  }

  const wallet = deductWallet({ gold: profile.gold ?? 0, points: profile.points ?? 0, costGold: reward.cost_gold, costPoints: reward.cost_points });
  await supabase.from("profiles").update(wallet).eq("id", userId);

  const { data: existing } = await supabase
    .from("inventory_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("reward_id", reward.id)
    .maybeSingle<{ id: string; quantity: number }>();

  if (existing) {
    await supabase.from("inventory_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
  } else {
    await supabase.from("inventory_items").insert({ user_id: userId, reward_id: reward.id, quantity: 1 });
  }

  await supabase.from("inventory_history").insert({ user_id: userId, action: "purchase_reward", quantity: 1 });

  return wallet;
}

export async function purchaseShopItem(userId: string, item: ShopItem, profile: Profile) {
  const supabase = createSupabaseServerClient();
  if (!canAfford({ gold: profile.gold ?? 0, points: profile.points ?? 0, costGold: item.cost_gold, costPoints: item.cost_points })) {
    throw new Error("Nicht genug Gold/Punkte.");
  }

  const wallet = deductWallet({ gold: profile.gold ?? 0, points: profile.points ?? 0, costGold: item.cost_gold, costPoints: item.cost_points });
  await supabase.from("profiles").update(wallet).eq("id", userId);

  const { data: existing } = await supabase
    .from("inventory_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("shop_item_id", item.id)
    .maybeSingle<{ id: string; quantity: number }>();

  if (existing && isItemStackable(item.item_type)) {
    await supabase.from("inventory_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
  } else if (!existing) {
    await supabase.from("inventory_items").insert({ user_id: userId, shop_item_id: item.id, quantity: 1 });
  }

  await supabase.from("inventory_history").insert({ user_id: userId, action: "purchase_item", quantity: 1 });

  return wallet;
}

export async function consumeInventoryItem(entry: InventoryItem) {
  const supabase = createSupabaseServerClient();
  const itemType = entry.shop_item?.item_type;
  const consumable = entry.reward ? true : itemType ? isItemConsumable(itemType) : false;

  if (!consumable) throw new Error("Dieses Item ist nicht verbrauchbar.");

  if (entry.quantity <= 1) {
    await supabase.from("inventory_items").delete().eq("id", entry.id);
  } else {
    await supabase.from("inventory_items").update({ quantity: entry.quantity - 1 }).eq("id", entry.id);
  }

  await supabase.from("inventory_history").insert({ user_id: entry.user_id, inventory_item_id: entry.id, action: "consume", quantity: 1 });
}
