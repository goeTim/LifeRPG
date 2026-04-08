import { SkillsSettingsList } from "@/components/skills-settings-list";
import { Skill } from "@/types/domain";

export function SkillsManagementPanel({ initialSkills }: { initialSkills: Skill[] }) {
  return <SkillsSettingsList initialSkills={initialSkills} />;
}
