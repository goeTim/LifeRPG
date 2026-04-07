"use client";

import { Task } from "@/types/domain";

type Props = { tasks: Task[]; title?: string; emptyLabel?: string };

export function TaskList({ tasks, title = "Heutige Tasks", emptyLabel = "Keine Tasks für heute." }: Props) {
  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {tasks.length === 0 && <p className="text-sm text-slate-400">{emptyLabel}</p>}
      {tasks.map((task) => {
        const weeklyTarget = task.habit_frequency_per_week ?? 0;
        const weeklyProgress = task.is_habit ? `${task.habit_weekly_completions}/${weeklyTarget} diese Woche` : null;

        return (
          <div key={task.id} className="flex items-center justify-between rounded-xl border border-slate-800 p-3">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-slate-400">
                {task.category} · {task.xp_value} XP · {task.points_value} Punkte
                {task.attribute_bonus ? ` · +${task.attribute_bonus}` : ""}
                {task.due_date ? ` · fällig: ${task.due_date}` : ""}
              </p>
              {weeklyProgress && <p className="text-xs text-violet-300">Gewohnheit · {weeklyProgress}</p>}
            </div>
            <button
              className="rounded-lg border border-emerald-700 bg-emerald-600/20 px-3 py-1 text-sm disabled:opacity-50"
              onClick={async () => {
                await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
                window.location.reload();
              }}
              disabled={!task.is_habit && task.is_completed}
            >
              {!task.is_habit && task.is_completed ? "Erledigt" : "Abschließen"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
