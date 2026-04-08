import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Skill, Task } from "@/types/domain";

export default async function TasksPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: tasks }, { data: skills }] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Task[]>(),
    supabase.from("skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Skill[]>()
  ]);

  const allTasks = (tasks ?? []).filter((task) => !task.is_habit);
  const allHabits = (tasks ?? []).filter((task) => task.is_habit);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
      <section className="space-y-6 md:col-span-2">
        <div className="card flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks & Gewohnheiten</h1>
            <p className="text-sm text-slate-300">Ordne Einträge deinen trainierbaren Skills zu und sammle gezielte Skill-XP.</p>
          </div>
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
            Zurück zum Dashboard
          </Link>
        </div>

        <TaskList tasks={allTasks} skills={skills ?? []} title="Alle Tasks" emptyLabel="Du hast noch keine Tasks erstellt." />
        <TaskList tasks={allHabits} skills={skills ?? []} title="Alle Gewohnheiten" emptyLabel="Du hast noch keine Gewohnheiten erstellt." />
      </section>

      <aside className="space-y-6">
        <TaskForm skills={skills ?? []} />
      </aside>
    </main>
  );
}
