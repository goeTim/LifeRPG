import { AchievementCode, AttributeKey } from "@/types/domain";

export const GLOBAL_XP_BASE = 100;
export const ATTRIBUTE_XP_BASE = 50;
export const SKILL_XP_BASE = 50;
export const GLOBAL_LEVEL_UP_GOLD_REWARD = 50;
export const ATTRIBUTE_LEVEL_UP_GOLD_REWARD = 20;
export const SKILL_LEVEL_UP_GOLD_REWARD = 15;

export const ATTRIBUTE_ORDER: AttributeKey[] = ["strength", "focus", "knowledge", "endurance", "discipline", "charisma"];

export const ATTRIBUTE_META: Record<AttributeKey, { label: string; description: string; color: string }> = {
  strength: {
    label: "Stärke",
    description: "Körperliche Power, Fitness und Durchsetzungsvermögen.",
    color: "from-rose-500 to-orange-400"
  },
  focus: {
    label: "Fokus",
    description: "Konzentration, tiefe Arbeit und mentale Klarheit.",
    color: "from-cyan-500 to-blue-500"
  },
  knowledge: {
    label: "Wissen",
    description: "Lernen, Verstehen und Erweiterung deines Horizonts.",
    color: "from-violet-500 to-fuchsia-500"
  },
  endurance: {
    label: "Ausdauer",
    description: "Konstanz, Belastbarkeit und langfristige Energie.",
    color: "from-emerald-500 to-lime-500"
  },
  discipline: {
    label: "Disziplin",
    description: "Routinen halten, trotz Widerstand handeln.",
    color: "from-amber-500 to-yellow-400"
  },
  charisma: {
    label: "Charisma",
    description: "Auftreten, Kommunikation und soziale Wirkung.",
    color: "from-pink-500 to-rose-400"
  }
};

export const SKILL_COLOR_PRESETS = ["#22c55e", "#06b6d4", "#a855f7", "#f97316", "#f43f5e", "#eab308", "#14b8a6", "#6366f1"];

export const AVATAR_OPTIONS = [{ id: "adventurer", label: "Abenteurer", emoji: "🧙" }] as const;

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementCode, { title: string; description: string; icon: string }> = {
  first_task: {
    title: "First Blood",
    description: "Schließe dein erstes Task ab.",
    icon: "⚔️"
  },
  five_tasks: {
    title: "Momentum",
    description: "Schließe 5 Tasks insgesamt ab.",
    icon: "🔥"
  },
  level_5: {
    title: "Hero Rank",
    description: "Erreiche Level 5.",
    icon: "👑"
  },
  three_day_streak: {
    title: "On Fire",
    description: "Halte eine 3-Tage-Streak.",
    icon: "📆"
  }
};
