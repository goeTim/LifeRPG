import Link from "next/link";
import { redirect } from "next/navigation";
import { AchievementsGrid } from "@/components/achievements-grid";
import { AttributeCard } from "@/components/attribute-card";
import { AttributeRadarChart } from "@/components/attribute-radar-chart";
import { AvatarPicker } from "@/components/avatar-picker";
import { ProfileHeader } from "@/components/profile-header";
import { ATTRIBUTE_META, ATTRIBUTE_ORDER, AVATAR_OPTIONS } from "@/lib/constants";
import { calculateAttributeProgress, calculateLevelProgress, getProfileAttributeStats, getRankTitle } from "@/lib/leveling";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { InventoryItem, Profile, UserAchievement } from "@/types/domain";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: achievements }, { data: titleInventory }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievement:achievements(*)")
      .eq("user_id", user.id)
      .returns<UserAchievement[]>(),
    supabase
      .from("inventory_items")
      .select("*, shop_item:shop_items(*)")
      .eq("user_id", user.id)
      .returns<InventoryItem[]>()
  ]);

  if (!profile) {
    redirect("/login");
  }

  const avatar = AVATAR_OPTIONS.find((item) => item.id === profile.avatar)?.emoji ?? "🧙";
  const globalProgress = calculateLevelProgress(profile.level, profile.xp);
  const attrs = getProfileAttributeStats(profile);

  const titles = (titleInventory ?? []).filter((entry) => entry.shop_item?.item_type === "title");
  const mainTitle = titles.find((entry) => entry.is_main_title)?.shop_item?.name ?? null;
  const activeOtherTitles = titles
    .filter((entry) => entry.is_active && !entry.is_main_title)
    .map((entry) => entry.shop_item?.name)
    .filter((name): name is string => !!name);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-8">
      <div className="flex justify-end gap-2">
        <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
          Zurück zum Dashboard
        </Link>
        <Link className="rounded-xl border border-cyan-700 px-4 py-2 font-semibold text-cyan-300" href="/inventory">
          Inventar
        </Link>
      </div>

      <ProfileHeader
        avatar={avatar}
        name={profile.name}
        level={profile.level}
        xp={profile.xp}
        xpNeeded={globalProgress.xpNeeded}
        xpPct={globalProgress.pct}
        gold={profile.gold}
        title={getRankTitle(profile.level)}
        mainTitle={mainTitle}
      />

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Titel</h2>
        {activeOtherTitles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeOtherTitles.map((title) => (
              <span key={title} className="rounded-xl border border-violet-600/60 bg-violet-500/10 px-3 py-1 text-sm text-violet-200">
                {title}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Keine weiteren aktiven Titel. Aktiviere Titel im Inventar.</p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AttributeRadarChart
            levels={Object.fromEntries(ATTRIBUTE_ORDER.map((key) => [key, attrs[key].level])) as Record<(typeof ATTRIBUTE_ORDER)[number], number>}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {ATTRIBUTE_ORDER.map((key) => {
              const stat = attrs[key];
              const progress = calculateAttributeProgress(stat.level, stat.xp);
              return (
                <AttributeCard
                  key={key}
                  label={ATTRIBUTE_META[key].label}
                  description={ATTRIBUTE_META[key].description}
                  level={stat.level}
                  xp={stat.xp}
                  xpNeeded={progress.xpNeeded}
                  xpRemaining={progress.xpRemaining}
                  progress={progress.pct}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <AvatarPicker selectedAvatar={profile.avatar} />
        </div>
      </section>

      <AchievementsGrid unlocked={achievements ?? []} />
    </main>
  );
}
