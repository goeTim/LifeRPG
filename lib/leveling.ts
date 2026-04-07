import { XP_PER_LEVEL } from "@/lib/constants";

export function calculateLevelProgress(level: number, xp: number) {
  const xpNeeded = XP_PER_LEVEL + (level - 1) * 20;
  const pct = Math.min(100, Math.round((xp / xpNeeded) * 100));
  return { xpNeeded, pct };
}

export function applyXpGain(level: number, currentXp: number, gainedXp: number) {
  let nextLevel = level;
  let xpPool = currentXp + gainedXp;

  while (true) {
    const needed = XP_PER_LEVEL + (nextLevel - 1) * 20;
    if (xpPool < needed) break;
    xpPool -= needed;
    nextLevel += 1;
  }

  return { level: nextLevel, xp: xpPool };
}
