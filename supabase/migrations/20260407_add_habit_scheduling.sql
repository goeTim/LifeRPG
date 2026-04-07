alter table public.tasks
  add column if not exists task_type text not null default 'one_time' check (task_type in ('one_time', 'habit')),
  add column if not exists weekly_frequency int check (weekly_frequency between 1 and 7),
  add column if not exists scheduled_days text[] not null default '{}';
