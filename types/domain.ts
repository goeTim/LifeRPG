export type AttributeKey = "strength" | "focus" | "knowledge" | "endurance" | "discipline" | "charisma";

export type AttributeStats = Record<AttributeKey, { level: number; xp: number }>;

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  gold: number;
  points: number;
  streak_count: number;
  last_completed_at: string | null;
  strength_level: number;
  strength_xp: number;
  focus_level: number;
  focus_xp: number;
  knowledge_level: number;
  knowledge_xp: number;
  endurance_level: number;
  endurance_xp: number;
  discipline_level: number;
  discipline_xp: number;
  charisma_level: number;
  charisma_xp: number;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  xp_value: number;
  points_value: number;
  attribute_bonus: AttributeKey | null;
  attribute_xp_rewards: Partial<Record<AttributeKey, number>> | null;
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  is_habit: boolean;
  habit_days: number[] | null;
  habit_frequency_per_week: number | null;
  habit_weekly_completions: number;
  habit_week_start: string | null;
};

export type AchievementCode = "first_task" | "five_tasks" | "level_5" | "three_day_streak";

export type Achievement = {
  id: string;
  code: AchievementCode;
  title: string;
  description: string;
};

export type UserAchievement = {
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
};
