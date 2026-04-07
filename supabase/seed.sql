insert into public.achievements (code, title, description)
values
  ('first_task', 'First Blood', 'Schließe dein erstes Task ab.'),
  ('five_tasks', 'Momentum', 'Schließe 5 Tasks insgesamt ab.'),
  ('level_5', 'Hero Rank', 'Erreiche Level 5.'),
  ('three_day_streak', 'On Fire', 'Halte eine 3-Tage-Streak.')
on conflict (code) do update
set title = excluded.title,
    description = excluded.description;

-- Demo inserts (replace <USER_UUID>):
-- insert into public.tasks (user_id, title, category, xp_value, attribute_bonus, task_type, due_date)
-- values ('<USER_UUID>', 'Arzttermin planen', 'Life Admin', 20, 'focus', 'one_time', current_date);
--
-- insert into public.tasks (user_id, title, category, xp_value, attribute_bonus, task_type, weekly_frequency, scheduled_days)
-- values ('<USER_UUID>', 'Workout', 'Fitness', 40, 'strength', 'habit', 3, '{mon,wed,fri}');
