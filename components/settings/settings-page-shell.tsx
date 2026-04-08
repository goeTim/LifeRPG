"use client";

import { useState } from "react";
import { HabitsManagementPanel } from "@/components/settings/habits-management-panel";
import { ItemsManagementPanel } from "@/components/settings/items-management-panel";
import { RewardsManagementPanel } from "@/components/settings/rewards-management-panel";
import { SettingsContentLayout } from "@/components/settings/settings-content-layout";
import { SettingsSectionKey, SettingsSidebar } from "@/components/settings/settings-sidebar";
import { SkillsManagementPanel } from "@/components/settings/skills-management-panel";
import { TasksManagementPanel } from "@/components/settings/tasks-management-panel";
import { CustomReward, ShopItem, Skill, Task } from "@/types/domain";

type Props = {
  activeSection: SettingsSectionKey;
  skills: Skill[];
  rewards: CustomReward[];
  items: ShopItem[];
  tasks: Task[];
};

export function SettingsPageShell({ activeSection, skills, rewards, items, tasks }: Props) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const counts = {
    skills: skills.length,
    rewards: rewards.length,
    items: items.length,
    tasks: tasks.filter((task) => !task.is_habit).length,
    habits: tasks.filter((task) => task.is_habit).length
  } as const;

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <div className="md:hidden">
        <button className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm" onClick={() => setIsMobileNavOpen((prev) => !prev)}>
          {isMobileNavOpen ? "Navigation schließen" : "Bereich wählen"}
        </button>
      </div>

      <div className={`${isMobileNavOpen ? "block" : "hidden"} md:sticky md:top-6 md:block md:h-fit`}>
        <SettingsSidebar activeSection={activeSection} counts={counts} onNavigate={() => setIsMobileNavOpen(false)} />
      </div>

      <SettingsContentLayout>
        {activeSection === "skills" && <SkillsManagementPanel initialSkills={skills} />}
        {activeSection === "rewards" && <RewardsManagementPanel initialRewards={rewards} />}
        {activeSection === "items" && <ItemsManagementPanel initialItems={items} />}
        {activeSection === "tasks" && <TasksManagementPanel initialTasks={tasks.filter((task) => !task.is_habit)} skills={skills} />}
        {activeSection === "habits" && <HabitsManagementPanel initialHabits={tasks.filter((task) => task.is_habit)} skills={skills} />}
      </SettingsContentLayout>
    </div>
  );
}
