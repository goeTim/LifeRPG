import { SettingsNavItem } from "@/components/settings/settings-nav-item";

export type SettingsSectionKey = "skills" | "rewards" | "items" | "tasks" | "habits";

type Props = {
  activeSection: SettingsSectionKey;
  counts: Record<SettingsSectionKey, number>;
  onNavigate?: () => void;
};

const progression: { key: SettingsSectionKey; label: string }[] = [
  { key: "skills", label: "Skills" },
  { key: "rewards", label: "Rewards" },
  { key: "items", label: "Items" }
];

const activity: { key: SettingsSectionKey; label: string }[] = [
  { key: "tasks", label: "Tasks" },
  { key: "habits", label: "Gewohnheiten" }
];

export function SettingsSidebar({ activeSection, counts, onNavigate }: Props) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Progression</p>
        <nav className="space-y-2" onClick={onNavigate}>
          {progression.map((item) => (
            <SettingsNavItem
              key={item.key}
              targetSection={item.key}
              label={item.label}
              count={counts[item.key]}
              active={activeSection === item.key}
            />
          ))}
        </nav>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Aktivität</p>
        <nav className="space-y-2" onClick={onNavigate}>
          {activity.map((item) => (
            <SettingsNavItem
              key={item.key}
              targetSection={item.key}
              label={item.label}
              count={counts[item.key]}
              active={activeSection === item.key}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
