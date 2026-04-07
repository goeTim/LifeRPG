import Link from "next/link";
import { redirect } from "next/navigation";
import { AchievementList } from "@/components/achievement-list";
import { ProgressBar } from "@/components/progress-bar";
import { TaskList } from "@/components/task-list";
import { todayTasks } from "@/lib/achievements";
import { calculateLevelProgress } from "@/lib/leveling";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Profile, Task, UserAchievement } from "@/types/domain";

const ATTR_LABELS: Record<string, string> = {
  strength: "Stärke",
  focus: "Fokus",
  knowledge: "Wissen",
  endurance: "Ausdauer",
  charisma: "Charisma"
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: tasks }, { data: achievements }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Task[]>(),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievement:achievements(*)")
      .eq("user_id", user.id)
      .returns<UserAchievement[]>()
  ]);

  if (!profile) {
    redirect("/login");
  }

  const progress = calculateLevelProgress(profile.level, profile.xp);
  const todaysTasks = todayTasks(tasks ?? []);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
      <section className="space-y-6 md:col-span-2">
        <div className="card space-y-3">
          <p className="text-sm text-slate-300">Hallo, {profile.name}</p>
          <div className="flex items-end justify-between">
            <h1 className="text-3xl font-bold">Level {profile.level}</h1>
            <form action="/api/auth/logout" method="post">
              <button className="text-sm text-slate-400 underline">Logout</button>
            </form>
          </div>
          <ProgressBar value={progress.pct} />
          <p className="text-sm text-slate-300">
            {profile.xp} / {progress.xpNeeded} XP bis zum nächsten Level · {profile.points ?? 0} Punkte
          </p>
          <Link className="btn-primary inline-flex" href="/tasks">
            Tasks & Gewohnheiten verwalten
          </Link>
        </div>

        <TaskList tasks={todaysTasks} />
      </section>

      <aside className="space-y-6">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Attribute</h2>
          {(Object.keys(ATTR_LABELS) as (keyof typeof ATTR_LABELS)[]).map((attr) => (
            <div key={attr} className="flex items-center justify-between rounded-xl bg-slate-900/50 px-3 py-2">
              <span>{ATTR_LABELS[attr]}</span>
              <span className="font-semibold">{profile[attr]}</span>
            </div>
          ))}
        </div>

        <AchievementList achievements={achievements ?? []} />
      </aside>
    </main>
  );
}
