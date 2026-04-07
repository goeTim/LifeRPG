import { AchievementCode } from "@/types/domain";

export const XP_PER_LEVEL = 100;

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementCode, { title: string; description: string }> = {
  first_task: {
    title: "First Blood",
    description: "Schließe dein erstes Task ab."
  },
  five_tasks: {
    title: "Momentum",
    description: "Schließe 5 Tasks insgesamt ab."
  },
  level_5: {
    title: "Hero Rank",
    description: "Erreiche Level 5."
  },
  three_day_streak: {
    title: "On Fire",
    description: "Halte eine 3-Tage-Streak."
  }
};
