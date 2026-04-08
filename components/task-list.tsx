"use client";

import { ATTRIBUTE_META, ATTRIBUTE_ORDER } from "@/lib/constants";
import { Task } from "@/types/domain";

type Props = { tasks: Task[]; title?: string; emptyLabel?: string };

function currentWeekStartISO(now = new Date()) {
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + diff);
  return start.toISOString().slice(0, 10);
}

export function TaskList({ tasks, title = "Heutige Tasks", emptyLabel = "Keine Tasks für heute." }: Props) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const weekStart = currentWeekStartISO();

  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {tasks.length === 0 && <p className="text-sm text-slate-400">{emptyLabel}</p>}
      {tasks.map((task) => {
        const weeklyTarget = task.habit_frequency_per_week ?? 0;
        const weeklyCount = task.habit_week_start === weekStart ? task.habit_weekly_completions : 0;
        const weeklyDone = task.is_habit && weeklyCount >= weeklyTarget && weeklyTarget > 0;
        const completedToday = task.completed_at?.slice(0, 10) === todayISO;
        const isDone = task.is_habit ? weeklyDone || completedToday : task.is_completed;
        const weeklyProgress = task.is_habit ? `${weeklyCount}/${weeklyTarget} diese Woche` : null;
        const attributeRewards = ATTRIBUTE_ORDER.map((key) => {
          const xp = task.attribute_xp_rewards?.[key] ?? 0;
          return xp > 0 ? `+${xp} ${ATTRIBUTE_META[key].label}-XP` : null;
        }).filter(Boolean);

        return (
          <div key={task.id} className="flex items-center justify-between rounded-xl border border-slate-800 p-3">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-slate-400">
                {task.category} · {task.xp_value} XP · {task.points_value} Punkte
                {task.due_date ? ` · fällig: ${task.due_date}` : ""}
              </p>
              {attributeRewards.length > 0 && <p className="text-xs text-violet-300">{attributeRewards.join(" · ")}</p>}
              {weeklyProgress && <p className="text-xs text-violet-300">Gewohnheit · {weeklyProgress}</p>}
            </div>
            <button
              className="rounded-lg border border-emerald-700 bg-emerald-600/20 px-3 py-1 text-sm disabled:opacity-50"
              onClick={async () => {
                await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
                window.location.reload();
              }}
              disabled={isDone}
            >
              {isDone ? "Erledigt" : "Abschließen"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
