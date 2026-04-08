import { ATTRIBUTE_LEVEL_UP_GOLD_REWARD, ATTRIBUTE_ORDER } from "@/lib/constants";
import { applyAttributeXpGain, applyGlobalXpGain, applySkillXpGain } from "@/lib/leveling";
import { AttributeKey, Profile, Skill, Task } from "@/types/domain";

export function getTaskAttributeRewards(task: Task): Partial<Record<AttributeKey, number>> {
  const legacyAttributeBonus = task.attribute_bonus
    ? { [task.attribute_bonus]: (task.attribute_xp_rewards?.[task.attribute_bonus] ?? 0) + 10 }
    : {};

  return {
    ...(task.attribute_xp_rewards ?? {}),
    ...Object.fromEntries(Object.entries(legacyAttributeBonus).filter(([, value]) => value > 0))
  };
}

export function applyTaskCompletionRewards(profile: Profile, task: Task, skill: Skill | null) {
  const globalLevelResult = applyGlobalXpGain(profile.level, profile.xp, task.xp_value);

  const attributeRewards = getTaskAttributeRewards(task);
  const attributeUpdate: Record<string, number> = {};
  let attributeGoldReward = 0;

  for (const key of ATTRIBUTE_ORDER) {
    const gainedXp = attributeRewards[key] ?? 0;
    const currentLevel = profile[`${key}_level`];
    const currentXp = profile[`${key}_xp`];
    const result = applyAttributeXpGain(currentLevel, currentXp, gainedXp);

    attributeUpdate[`${key}_level`] = result.level;
    attributeUpdate[`${key}_xp`] = result.xp;
    attributeGoldReward += result.levelsGained * ATTRIBUTE_LEVEL_UP_GOLD_REWARD;
  }

  const skillRewardXp = task.skill_xp_reward ?? 0;
  const skillLevelResult = skill && skillRewardXp > 0 ? applySkillXpGain(skill.level, skill.xp, skillRewardXp) : null;

  return {
    profileUpdate: {
      level: globalLevelResult.level,
      xp: globalLevelResult.xp,
      points: (profile.points ?? 0) + (task.points_value ?? 0),
      gold: (profile.gold ?? 0) + globalLevelResult.goldReward + attributeGoldReward + (skillLevelResult?.goldReward ?? 0),
      ...attributeUpdate
    },
    skillUpdate: skillLevelResult
      ? {
          level: skillLevelResult.level,
          xp: skillLevelResult.xp
        }
      : null,
    globalLevelResult
  };
}
