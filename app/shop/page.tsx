import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopGrid } from "@/components/shop-grid";
import { ShopHeader } from "@/components/shop-header";
import { toPurchasableView } from "@/lib/inventory";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CustomReward, Profile, ShopItem } from "@/types/domain";

export default async function ShopPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: rewards }, { data: items }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("custom_rewards").select("*").eq("user_id", user.id).returns<CustomReward[]>(),
    supabase.from("shop_items").select("*").or(`user_id.eq.${user.id},user_id.is.null`).returns<ShopItem[]>()
  ]);

  if (!profile) redirect("/dashboard");

  const rewardCards = (rewards ?? []).map((reward) => toPurchasableView(reward, null)).filter((item) => !!item);
  const groupedItems = (items ?? []).reduce(
    (acc, item) => {
      const view = toPurchasableView(null, item);
      if (view) acc[item.item_type].push(view);
      return acc;
    },
    { consumable: [], cosmetic: [], title: [], unlockable: [] } as Record<string, NonNullable<ReturnType<typeof toPurchasableView>>[]>
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-8">
      <div className="flex justify-end gap-2">
        <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
          Dashboard
        </Link>
        <Link className="rounded-xl border border-cyan-700 px-4 py-2 font-semibold text-cyan-300" href="/inventory">
          Inventar
        </Link>
      </div>
      <ShopHeader gold={profile.gold ?? 0} points={profile.points ?? 0} />
      <ShopGrid initialGold={profile.gold ?? 0} initialPoints={profile.points ?? 0} rewards={rewardCards} items={groupedItems} />
    </main>
  );
}
