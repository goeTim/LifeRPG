import {
  ATTRIBUTE_LEVEL_UP_GOLD_REWARD,
  ATTRIBUTE_XP_BASE,
  ATTRIBUTE_ORDER,
  GLOBAL_LEVEL_UP_GOLD_REWARD,
  GLOBAL_XP_BASE,
  SKILL_LEVEL_UP_GOLD_REWARD,
  SKILL_XP_BASE
} from "@/lib/constants";
import { AttributeKey, Profile } from "@/types/domain";

export function getGlobalXpNeeded(level: number) {
  return GLOBAL_XP_BASE * level;
}

export function getAttributeXpNeeded(level: number) {
  return ATTRIBUTE_XP_BASE * level;
}

export function getSkillXpNeeded(level: number) {
  return SKILL_XP_BASE * level;
}

export function calculateLevelProgress(level: number, xp: number) {
  const xpNeeded = getGlobalXpNeeded(level);
  const pct = Math.min(100, Math.round((xp / xpNeeded) * 100));
  return { xpNeeded, pct };
}

export function calculateAttributeProgress(level: number, xp: number) {
  const xpNeeded = getAttributeXpNeeded(level);
  const pct = Math.min(100, Math.round((xp / xpNeeded) * 100));
  return { xpNeeded, pct, xpRemaining: Math.max(xpNeeded - xp, 0) };
}

export function calculateSkillProgress(level: number, xp: number) {
  const xpNeeded = getSkillXpNeeded(level);
  const pct = Math.min(100, Math.round((xp / xpNeeded) * 100));
  return { xpNeeded, pct, xpRemaining: Math.max(xpNeeded - xp, 0) };
}

export function applyGlobalXpGain(level: number, currentXp: number, gainedXp: number) {
  let nextLevel = level;
  let xpPool = currentXp + gainedXp;
  let levelsGained = 0;

  while (xpPool >= getGlobalXpNeeded(nextLevel)) {
    xpPool -= getGlobalXpNeeded(nextLevel);
    nextLevel += 1;
    levelsGained += 1;
  }

  return {
    level: nextLevel,
    xp: xpPool,
    levelsGained,
    goldReward: levelsGained * GLOBAL_LEVEL_UP_GOLD_REWARD
  };
}

export function applyAttributeXpGain(level: number, currentXp: number, gainedXp: number) {
  let nextLevel = level;
  let xpPool = currentXp + gainedXp;
  let levelsGained = 0;

  while (xpPool >= getAttributeXpNeeded(nextLevel)) {
    xpPool -= getAttributeXpNeeded(nextLevel);
    nextLevel += 1;
    levelsGained += 1;
  }

  return {
    level: nextLevel,
    xp: xpPool,
    levelsGained,
    goldReward: levelsGained * ATTRIBUTE_LEVEL_UP_GOLD_REWARD
  };
}

export function applySkillXpGain(level: number, currentXp: number, gainedXp: number) {
  let nextLevel = level;
  let xpPool = currentXp + gainedXp;
  let levelsGained = 0;

  while (xpPool >= getSkillXpNeeded(nextLevel)) {
    xpPool -= getSkillXpNeeded(nextLevel);
    nextLevel += 1;
    levelsGained += 1;
  }

  return {
    level: nextLevel,
    xp: xpPool,
    levelsGained,
    goldReward: levelsGained * SKILL_LEVEL_UP_GOLD_REWARD
  };
}

export function getProfileAttributeStats(profile: Profile) {
  return Object.fromEntries(
    ATTRIBUTE_ORDER.map((key) => [key, { level: profile[`${key}_level`], xp: profile[`${key}_xp`] }])
  ) as Record<AttributeKey, { level: number; xp: number }>;
}

export function getRankTitle(level: number) {
  if (level >= 20) return "Champion";
  if (level >= 10) return "Abenteurer";
  return "Novize";
}
