create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  level int not null default 1,
  xp int not null default 0,
  points int not null default 0,
  streak_count int not null default 0,
  last_completed_at timestamptz,
  strength int not null default 1,
  focus int not null default 1,
  knowledge int not null default 1,
  endurance int not null default 1,
  charisma int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  xp_value int not null check (xp_value > 0),
  points_value int not null default 0 check (points_value >= 0),
  attribute_bonus text check (attribute_bonus in ('strength', 'focus', 'knowledge', 'endurance', 'charisma')),
  is_completed boolean not null default false,
  due_date date,
  completed_at timestamptz,
  is_habit boolean not null default false,
  habit_days int[] check (habit_days is null or habit_days <@ array[0,1,2,3,4,5,6]),
  habit_frequency_per_week int check (habit_frequency_per_week is null or habit_frequency_per_week > 0),
  habit_weekly_completions int not null default 0,
  habit_week_start date,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists points int not null default 0;
alter table public.tasks add column if not exists points_value int not null default 0;
alter table public.tasks add column if not exists is_habit boolean not null default false;
alter table public.tasks add column if not exists habit_days int[];
alter table public.tasks add column if not exists habit_frequency_per_week int;
alter table public.tasks add column if not exists habit_weekly_completions int not null default 0;
alter table public.tasks add column if not exists habit_week_start date;

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null
);

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "profiles owner" on public.profiles;
create policy "profiles owner"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "tasks owner" on public.tasks;
create policy "tasks owner"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "achievements read" on public.achievements;
create policy "achievements read"
  on public.achievements for select
  using (true);

drop policy if exists "user achievements owner" on public.user_achievements;
create policy "user achievements owner"
  on public.user_achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
