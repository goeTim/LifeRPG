"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/settings/empty-state";
import { SearchBar } from "@/components/settings/search-bar";
import { SectionHeader } from "@/components/settings/section-header";
import { Skill, Task } from "@/types/domain";

type EditableTask = Pick<Task, "id" | "title" | "xp_value" | "skill_id" | "is_completed" | "due_date" | "skill_xp_reward">;

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Request fehlgeschlagen" }))) as { error?: string };
    throw new Error(payload.error ?? "Request fehlgeschlagen");
  }
  return response.json();
}

export function TasksManagementPanel({ initialTasks, skills }: { initialTasks: Task[]; skills: Skill[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditableTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  const skillNameById = useMemo(() => Object.fromEntries(skills.map((skill) => [skill.id, `${skill.icon ?? "🎯"} ${skill.name}`])), [skills]);

  const filtered = useMemo(
    () => tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase())),
    [tasks, query]
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Tasks verwalten"
        description="Aktive Tasks bearbeiten, priorisieren oder entfernen."
        action={<span className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300">{tasks.length} aktiv</span>}
      />

      {error && <p className="rounded-lg border border-rose-600/30 bg-rose-900/20 p-2 text-sm text-rose-300">{error}</p>}

      <SearchBar value={query} onChange={setQuery} placeholder="Tasks durchsuchen" />

      {editing && (
        <div className="space-y-3 rounded-xl border border-cyan-700/40 bg-cyan-900/10 p-4">
          <h3 className="font-semibold">Task bearbeiten</h3>
          <div className="grid gap-2 md:grid-cols-2">
            <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <input
              className="input"
              type="number"
              min={0}
              value={editing.xp_value}
              onChange={(e) => setEditing({ ...editing, xp_value: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              min={0}
              value={editing.skill_xp_reward}
              onChange={(e) => setEditing({ ...editing, skill_xp_reward: Number(e.target.value) })}
              placeholder="Skill-XP"
            />
            <input
              className="input"
              type="date"
              value={editing.due_date ?? ""}
              onChange={(e) => setEditing({ ...editing, due_date: e.target.value || null })}
            />
            <select className="input" value={editing.skill_id ?? ""} onChange={(e) => setEditing({ ...editing, skill_id: e.target.value || null })}>
              <option value="">Kein Skill</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.icon ?? "🎯"} {skill.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={editing.is_completed}
                onChange={(e) => setEditing({ ...editing, is_completed: e.target.checked })}
              />
              Bereits abgeschlossen
            </label>
          </div>

          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  setError(null);
                  const payload = await request(`/api/tasks/${editing.id}`, { method: "PATCH", body: JSON.stringify(editing) });
                  setTasks((current) => current.map((task) => (task.id === editing.id ? payload.task : task)));
                  setEditing(null);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Task konnte nicht gespeichert werden.");
                }
              }}
            >
              Änderungen speichern
            </button>
            <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={() => setEditing(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="Keine aktiven Tasks" description="Lege im Bereich Tasks neue Einträge an oder passe deine Filter an." />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <article key={task.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-xs text-slate-400">
                    {task.xp_value} globale XP · Status: {task.is_completed ? "abgeschlossen" : "offen"}
                    {task.due_date ? ` · fällig: ${task.due_date}` : ""}
                  </p>
                  <p className="text-xs text-cyan-300">Skill: {task.skill_id ? skillNameById[task.skill_id] ?? "(gelöscht)" : "nicht zugeordnet"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl border border-cyan-700 px-3 py-1 text-sm text-cyan-300"
                    onClick={() =>
                      setEditing({
                        id: task.id,
                        title: task.title,
                        xp_value: task.xp_value,
                        skill_id: task.skill_id,
                        is_completed: task.is_completed,
                        due_date: task.due_date,
                        skill_xp_reward: task.skill_xp_reward
                      })
                    }
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="rounded-xl border border-rose-700 px-3 py-1 text-sm text-rose-300"
                    onClick={async () => {
                      try {
                        setError(null);
                        await request(`/api/tasks/${task.id}`, { method: "DELETE" });
                        setTasks((current) => current.filter((entry) => entry.id !== task.id));
                        if (editing?.id === task.id) setEditing(null);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Task konnte nicht gelöscht werden.");
                      }
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
