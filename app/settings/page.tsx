import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";
import { SettingsSectionKey } from "@/components/settings/settings-sidebar";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CustomReward, ShopItem, Skill, Task } from "@/types/domain";

const VALID_SECTIONS: SettingsSectionKey[] = [
  "skills",
  "rewards",
  "items",
  "tasks",
  "habits",
  "account-name",
  "account-password",
  "account-reset"
];

export default async function SettingsPage({ searchParams }: { searchParams?: { section?: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: skills }, { data: rewards }, { data: items }, { data: tasks }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.id).single<{ name: string }>(),
    supabase.from("skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Skill[]>(),
    supabase.from("custom_rewards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<CustomReward[]>(),
    supabase.from("shop_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<ShopItem[]>(),
    supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Task[]>()
  ]);

  const activeSection = VALID_SECTIONS.includes((searchParams?.section as SettingsSectionKey) ?? "skills")
    ? ((searchParams?.section as SettingsSectionKey) ?? "skills")
    : "skills";

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Settings</p>
          <h1 className="text-3xl font-bold">Verwaltungszentrale</h1>
          <p className="text-sm text-slate-300">Konfiguriere Progression, Aktivität und Account in einer zentralen Navigation.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-xl border border-violet-700 px-4 py-2 font-semibold text-violet-300" href="/tasks">
            Zu Tasks
          </Link>
        </div>
      </div>

      <SettingsPageShell
        activeSection={activeSection}
        skills={skills ?? []}
        rewards={rewards ?? []}
        items={items ?? []}
        tasks={tasks ?? []}
        initialName={profile?.name ?? "Abenteurer"}
      />
    </main>
  );
}
