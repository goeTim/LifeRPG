"use client";

import { Task } from "@/types/domain";

type Props = { tasks: Task[] };

export function TaskList({ tasks }: Props) {
  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-semibold">Heutige Tasks</h2>
      {tasks.length === 0 && <p className="text-sm text-slate-400">Keine Tasks für heute.</p>}
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded-xl border border-slate-800 p-3">
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-xs text-slate-400">
              {task.category} · {task.xp_value} XP {task.attribute_bonus ? `· +${task.attribute_bonus}` : ""}
            </p>
          </div>
          <button
            className="rounded-lg border border-emerald-700 bg-emerald-600/20 px-3 py-1 text-sm disabled:opacity-50"
            onClick={async () => {
              await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
              window.location.reload();
            }}
            disabled={task.is_completed}
          >
            {task.is_completed ? "Erledigt" : "Abschließen"}
          </button>
        </div>
      ))}
    </div>
  );
}
