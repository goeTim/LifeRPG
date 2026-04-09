import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/task-list";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Skill, Task } from "@/types/domain";

export default async function OpenTasksPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: tasks }, { data: skills }] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", user.id).eq("is_habit", false).eq("is_completed", false).returns<Task[]>(),
    supabase.from("skills").select("*").eq("user_id", user.id).returns<Skill[]>()
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const openTasks = tasks ?? [];

  const dueToday = openTasks.filter((task) => task.due_date === today);
  const noDueDate = openTasks.filter((task) => !task.due_date);
  const dueLaterOrEarlier = openTasks
    .filter((task) => task.due_date && task.due_date !== today)
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold">Offene Tasks</h1>
          <p className="text-sm text-slate-300">Hier siehst du alle offenen Tasks, sortiert nach Fälligkeit.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-xl border border-cyan-700 px-4 py-2 font-semibold text-cyan-300" href="/tasks">
            Neuer Eintrag
          </Link>
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </section>

      <TaskList tasks={dueToday} skills={skills ?? []} title="1) Fällig heute" emptyLabel="Keine heute fälligen Tasks." />
      <TaskList tasks={noDueDate} skills={skills ?? []} title="2) Ohne Fälligkeitsdatum" emptyLabel="Keine offenen Tasks ohne Datum." />
      <TaskList
        tasks={dueLaterOrEarlier}
        skills={skills ?? []}
        title="3) Alle übrigen mit Fälligkeitsdatum"
        emptyLabel="Keine weiteren offenen Tasks mit Datum."
      />
    </main>
  );
}
