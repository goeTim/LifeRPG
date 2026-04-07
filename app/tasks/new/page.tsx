import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskCreateForm } from "@/components/task-create-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function NewTaskPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 px-6 py-8">
      <Link href="/dashboard" className="text-sm text-slate-300 underline">
        ← Zurück zum Dashboard
      </Link>
      <TaskCreateForm />
    </main>
  );
}
