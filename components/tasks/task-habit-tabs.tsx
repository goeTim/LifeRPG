type Mode = "task" | "habit";

type TaskHabitTabsProps = {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
};

const TABS: { mode: Mode; label: string }[] = [
  { mode: "task", label: "Task" },
  { mode: "habit", label: "Gewohnheit" }
];

export function TaskHabitTabs({ activeMode, onModeChange }: TaskHabitTabsProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-2">
      <div className="grid grid-cols-2 gap-2">
        {TABS.map((tab) => {
          const active = activeMode === tab.mode;
          return (
            <button
              key={tab.mode}
              type="button"
              onClick={() => onModeChange(tab.mode)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border border-cyan-400/70 bg-cyan-500/20 text-cyan-100 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
                  : "border border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:text-slate-100"
              }`}
              aria-pressed={active}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
