"use client";

import { useMemo, useState } from "react";
import { TaskList } from "@/components/task-list";
import { TaskHabitTabs } from "@/components/tasks/task-habit-tabs";
import { Skill, Task } from "@/types/domain";

function currentWeekStartISO(now = new Date()) {
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + diff);
  return start.toISOString().slice(0, 10);
}

export function OpenOverviewPanel({ tasks, habits, skills }: { tasks: Task[]; habits: Task[]; skills: Skill[] }) {
  const [mode, setMode] = useState<"task" | "habit">("task");

  const { dueToday, noDueDate, dueLaterOrEarlier, habitsDueToday, habitsWeeklyOpenNoDays, habitsDoneThisWeek } = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const weekday = new Date().getUTCDay();
    const weekStart = currentWeekStartISO();

    const dueTodayTasks = tasks.filter((task) => task.due_date === todayISO);
    const noDueDateTasks = tasks.filter((task) => !task.due_date);
    const datedTasks = tasks.filter((task) => task.due_date && task.due_date !== todayISO).sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));

    const habitsDone = habits.filter((habit) => {
      const weeklyTarget = habit.habit_frequency_per_week ?? Math.max(1, habit.habit_days?.length ?? 1);
      const weeklyCount = habit.habit_week_start === weekStart ? habit.habit_weekly_completions : 0;
      const completedToday = habit.completed_at?.slice(0, 10) === todayISO;
      return weeklyCount >= weeklyTarget || completedToday;
    });

    const habitsToday = habits.filter((habit) => {
      const weeklyTarget = habit.habit_frequency_per_week ?? Math.max(1, habit.habit_days?.length ?? 1);
      const weeklyCount = habit.habit_week_start === weekStart ? habit.habit_weekly_completions : 0;
      const completedToday = habit.completed_at?.slice(0, 10) === todayISO;
      const done = weeklyCount >= weeklyTarget || completedToday;
      const hasSpecificDays = Boolean(habit.habit_days && habit.habit_days.length > 0);
      return hasSpecificDays && habit.habit_days?.includes(weekday) && !done;
    });

    const habitsNoDaysOpen = habits.filter((habit) => {
      const weeklyTarget = habit.habit_frequency_per_week ?? Math.max(1, habit.habit_days?.length ?? 1);
      const weeklyCount = habit.habit_week_start === weekStart ? habit.habit_weekly_completions : 0;
      const completedToday = habit.completed_at?.slice(0, 10) === todayISO;
      const done = weeklyCount >= weeklyTarget || completedToday;
      const hasSpecificDays = Boolean(habit.habit_days && habit.habit_days.length > 0);
      return !hasSpecificDays && !done;
    });

    return {
      dueToday: dueTodayTasks,
      noDueDate: noDueDateTasks,
      dueLaterOrEarlier: datedTasks,
      habitsDueToday: habitsToday,
      habitsWeeklyOpenNoDays: habitsNoDaysOpen,
      habitsDoneThisWeek: habitsDone
    };
  }, [tasks, habits]);

  return (
    <div className="space-y-4">
      <TaskHabitTabs activeMode={mode} onModeChange={setMode} />

      {mode === "task" ? (
        <div className="space-y-4">
          <TaskList tasks={dueToday} skills={skills} title="1) Fällig heute" emptyLabel="Keine heute fälligen Tasks." />
          <TaskList tasks={noDueDate} skills={skills} title="2) Ohne Fälligkeitsdatum" emptyLabel="Keine offenen Tasks ohne Datum." />
          <TaskList tasks={dueLaterOrEarlier} skills={skills} title="3) Alle übrigen mit Fälligkeitsdatum" emptyLabel="Keine weiteren offenen Tasks mit Datum." />
        </div>
      ) : (
        <div className="space-y-4">
          <TaskList tasks={habitsDueToday} skills={skills} title="1) Heute zu erledigen (mit Wochentag)" emptyLabel="Heute sind keine tagesgebundenen Gewohnheiten offen." />
          <TaskList
            tasks={habitsWeeklyOpenNoDays}
            skills={skills}
            title="2) Diese Woche offen (ohne Wochentage)"
            emptyLabel="Alle wochenbasierten Gewohnheiten sind bereits für diese Woche erledigt."
          />
          <TaskList tasks={habitsDoneThisWeek} skills={skills} title="3) Diese Woche bereits erledigt" emptyLabel="Noch keine Gewohnheit wurde diese Woche erledigt." />
        </div>
      )}
    </div>
  );
}
