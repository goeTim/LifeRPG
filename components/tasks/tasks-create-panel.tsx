"use client";

import { useState } from "react";
import { Skill } from "@/types/domain";
import { HabitCreateForm } from "@/components/tasks/habit-create-form";
import { TaskCreateForm } from "@/components/tasks/task-create-form";
import { TaskHabitTabs } from "@/components/tasks/task-habit-tabs";

type Mode = "task" | "habit";

export function TasksCreatePanel({ skills }: { skills: Skill[] }) {
  const [mode, setMode] = useState<Mode>("task");

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
      <TaskHabitTabs activeMode={mode} onModeChange={setMode} />

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
        {mode === "task" ? <TaskCreateForm skills={skills} /> : <HabitCreateForm skills={skills} />}
      </div>
    </div>
  );
}
