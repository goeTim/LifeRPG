import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { todayTasks } from "@/lib/achievements";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Task } from "@/types/domain";

export default async function TasksPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tasks } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Task[]>();

  const today = todayTasks(tasks ?? []).filter((task) => !task.is_habit);
  const habits = todayTasks(tasks ?? []).filter((task) => task.is_habit);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
      <section className="space-y-6 md:col-span-2">
        <div className="card flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks & Gewohnheiten</h1>
            <p className="text-sm text-slate-300">Erstelle einmalige Aufgaben oder wiederkehrende Gewohnheiten.</p>
          </div>
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
            Zurück zum Dashboard
          </Link>
        </div>

        <TaskList tasks={today} title="Heutige & offene Tasks" emptyLabel="Keine offenen Tasks für heute." />
        <TaskList tasks={habits} title="Heutige Gewohnheiten" emptyLabel="Heute sind keine Gewohnheiten fällig." />
      </section>

      <aside className="space-y-6">
        <TaskForm />
      </aside>
    </main>
  );
}
