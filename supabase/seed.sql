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
-- insert into public.tasks (user_id, title, category, xp_value, attribute_xp_rewards, due_date)
-- values
--   ('<USER_UUID>', '30 Min Workout', 'Fitness', 40, '{"strength": 20, "endurance": 10}'::jsonb, current_date),
--   ('<USER_UUID>', 'Read 20 pages', 'Learning', 25, '{"knowledge": 20, "focus": 5}'::jsonb, current_date),
--   ('<USER_UUID>', 'Deep Work Sprint', 'Career', 30, '{"focus": 20, "discipline": 10}'::jsonb, current_date + interval '1 day');
