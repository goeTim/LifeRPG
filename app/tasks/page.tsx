import Link from "next/link";
import { redirect } from "next/navigation";
import { TasksCreatePanel } from "@/components/tasks/tasks-create-panel";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Skill } from "@/types/domain";

export default async function TasksPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Skill[]>();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold">Neue Einträge erstellen</h1>
          <p className="text-sm text-slate-300">Erstelle hier gezielt neue Tasks oder Gewohnheiten.</p>
        </div>
        <Link className="rounded-xl border border-slate-600 px-4 py-2 text-center font-semibold" href="/dashboard">
          Zurück zum Dashboard
        </Link>
      </section>

      <TasksCreatePanel skills={skills ?? []} />
    </main>
  );
}
