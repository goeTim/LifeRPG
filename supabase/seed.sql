insert into public.achievements (code, title, description)
values
  ('first_task', 'First Blood', 'Schließe dein erstes Task ab.'),
  ('five_tasks', 'Momentum', 'Schließe 5 Tasks insgesamt ab.'),
  ('level_5', 'Hero Rank', 'Erreiche Level 5.'),
  ('three_day_streak', 'On Fire', 'Halte eine 3-Tage-Streak.')
on conflict (code) do update
set title = excluded.title,
    description = excluded.description;

-- Demo user profile/tasks must be inserted after creating a real auth.users user.
-- Example:
-- insert into public.skills (user_id, name, description, icon, color, primary_attribute, secondary_attribute)
-- values
--   ('<USER_UUID>', 'Fitness', 'Kraft und Kondition trainieren', '💪', '#22c55e', 'strength', 'endurance'),
--   ('<USER_UUID>', 'Lesen', 'Täglich Wissen aufbauen', '📚', '#8b5cf6', 'knowledge', 'focus');
--
-- insert into public.tasks (user_id, title, xp_value, points_value, attribute_xp_rewards, skill_id, skill_xp_reward, due_date)
-- values
--   ('<USER_UUID>', '30 Min Workout', 40, 15, '{"strength": 20, "endurance": 10}'::jsonb, '<FITNESS_SKILL_UUID>', 25, current_date),
--   ('<USER_UUID>', 'Read 20 pages', 25, 10, '{"knowledge": 20, "focus": 5}'::jsonb, '<LESEN_SKILL_UUID>', 20, current_date),
--   ('<USER_UUID>', 'Deep Work Sprint', 30, 12, '{"focus": 20, "discipline": 10}'::jsonb, null, 0, current_date + interval '1 day');
