export type AttributeKey = "strength" | "focus" | "knowledge" | "endurance" | "charisma";
export type TaskType = "one_time" | "habit";

export type Profile = {
  id: string;
  name: string;
  level: number;
  xp: number;
  streak_count: number;
  last_completed_at: string | null;
  strength: number;
  focus: number;
  knowledge: number;
  endurance: number;
  charisma: number;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  xp_value: number;
  attribute_bonus: AttributeKey | null;
  task_type: TaskType;
  weekly_frequency: number | null;
  scheduled_days: string[];
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
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
