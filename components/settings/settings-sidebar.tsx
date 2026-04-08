import { SettingsNavItem } from "@/components/settings/settings-nav-item";

export type SettingsSectionKey = "skills" | "rewards" | "items" | "tasks" | "habits" | "account-name" | "account-password" | "account-reset";

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

const account: { key: SettingsSectionKey; label: string }[] = [
  { key: "account-name", label: "Name ändern" },
  { key: "account-password", label: "Passwort ändern" },
  { key: "account-reset", label: "Fortschritt zurücksetzen" }
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

      <div className="rounded-2xl border border-violet-700/30 bg-violet-950/20 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-violet-200">Account</p>
        <nav className="space-y-2" onClick={onNavigate}>
          {account.map((item) => (
            <SettingsNavItem
              key={item.key}
              targetSection={item.key}
              label={item.label}
              active={activeSection === item.key}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
