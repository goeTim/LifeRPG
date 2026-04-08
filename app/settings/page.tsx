import Link from "next/link";
import { redirect } from "next/navigation";
import { ItemsSettingsList } from "@/components/items-settings-list";
import { RewardsSettingsList } from "@/components/rewards-settings-list";
import { SkillsSettingsList } from "@/components/skills-settings-list";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CustomReward, ShopItem, Skill } from "@/types/domain";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: skills }, { data: rewards }, { data: items }] = await Promise.all([
    supabase.from("skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Skill[]>(),
    supabase.from("custom_rewards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<CustomReward[]>(),
    supabase.from("shop_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<ShopItem[]>()
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-8">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Settings</p>
          <h1 className="text-3xl font-bold">Verwaltung</h1>
          <p className="text-sm text-slate-300">Skills, Rewards und Ingame-Items zentral konfigurieren.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-xl border border-violet-700 px-4 py-2 font-semibold text-violet-300" href="/shop">
            Zum Shop
          </Link>
        </div>
      </div>

      <SkillsSettingsList initialSkills={skills ?? []} />
      <RewardsSettingsList initialRewards={rewards ?? []} />
      <ItemsSettingsList initialItems={items ?? []} />
    </main>
  );
}
