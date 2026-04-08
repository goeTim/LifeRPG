import Link from "next/link";
import { redirect } from "next/navigation";
import { AchievementList } from "@/components/achievement-list";
import { GoldDisplay } from "@/components/gold-display";
import { ProgressBar } from "@/components/progress-bar";
import { TaskList } from "@/components/task-list";
import { ATTRIBUTE_META, ATTRIBUTE_ORDER } from "@/lib/constants";
import { calculateLevelProgress } from "@/lib/leveling";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Profile, Skill, Task, UserAchievement } from "@/types/domain";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: tasks }, { data: achievements }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Task[]>(),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievement:achievements(*)")
      .eq("user_id", user.id)
      .returns<UserAchievement[]>(),
    supabase.from("skills").select("*").eq("user_id", user.id).returns<Skill[]>()
  ]);

  if (!profile) {
    redirect("/login");
  }

  const progress = calculateLevelProgress(profile.level, profile.xp);
  const allTasks = (tasks ?? []).filter((task) => !task.is_habit);
  const allHabits = (tasks ?? []).filter((task) => task.is_habit);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
      <section className="space-y-6 md:col-span-2">
        <div className="card space-y-3">
          <p className="text-sm text-slate-300">Hallo, {profile.name}</p>
          <div className="flex items-end justify-between gap-2">
            <h1 className="text-3xl font-bold">Level {profile.level}</h1>
            <div className="flex items-center gap-3">
              <GoldDisplay amount={profile.gold ?? 0} />
              <form action="/api/auth/logout" method="post">
                <button className="text-sm text-slate-400 underline">Logout</button>
              </form>
            </div>
          </div>
          <ProgressBar value={progress.pct} />
          <p className="text-sm text-slate-300">
            {profile.xp} / {progress.xpNeeded} XP bis zum nächsten Level · {profile.points ?? 0} Punkte
          </p>
          <div className="flex gap-3">
            <Link className="btn-primary inline-flex" href="/tasks">
              Neues Task / Gewohnheit erstellen
            </Link>
            <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/profile">
              Zur Profilseite
            </Link>
            <Link className="rounded-xl border border-cyan-700 px-4 py-2 font-semibold text-cyan-300" href="/settings">
              Verwaltung
            </Link>
            <Link className="rounded-xl border border-violet-700 px-4 py-2 font-semibold text-violet-300" href="/shop">
              Shop
            </Link>
            <Link className="rounded-xl border border-emerald-700 px-4 py-2 font-semibold text-emerald-300" href="/inventory">
              Inventar
            </Link>
          </div>
        </div>

        <TaskList tasks={allTasks} skills={skills ?? []} title="Alle Tasks" emptyLabel="Du hast noch keine Tasks erstellt." />
        <TaskList tasks={allHabits} skills={skills ?? []} title="Alle Gewohnheiten" emptyLabel="Du hast noch keine Gewohnheiten erstellt." />
      </section>

      <aside className="space-y-6">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Attribut-Level</h2>
          {ATTRIBUTE_ORDER.map((attr) => (
            <div key={attr} className="flex items-center justify-between rounded-xl bg-slate-900/50 px-3 py-2">
              <span>{ATTRIBUTE_META[attr].label}</span>
              <span className="font-semibold">{profile[`${attr}_level`]}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <p className="text-sm text-slate-300">Trainierbare Skills</p>
          <p className="text-3xl font-bold">{skills?.length ?? 0}</p>
        </div>

        <AchievementList achievements={achievements ?? []} />
      </aside>
    </main>
  );
}
