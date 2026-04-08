import Link from "next/link";
import { redirect } from "next/navigation";
import { SkillsSettingsList } from "@/components/skills-settings-list";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Skill } from "@/types/domain";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: skills } = await supabase.from("skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).returns<Skill[]>();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-8">
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Settings</p>
          <h1 className="text-3xl font-bold">Skill-System konfigurieren</h1>
          <p className="text-sm text-slate-300">Baue deine eigenen trainierbaren Lebensbereiche und steuere so deine RPG-Progression.</p>
        </div>
        <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/dashboard">
          Zurück zum Dashboard
        </Link>
      </div>

      <SkillsSettingsList initialSkills={skills ?? []} />
    </main>
  );
}
