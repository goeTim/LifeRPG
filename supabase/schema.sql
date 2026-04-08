create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text not null default 'adventurer',
  level int not null default 1,
  xp int not null default 0,
  gold int not null default 0,
  points int not null default 0,
  streak_count int not null default 0,
  last_completed_at timestamptz,
  strength int not null default 1,
  focus int not null default 1,
  knowledge int not null default 1,
  endurance int not null default 1,
  discipline int not null default 1,
  charisma int not null default 1,
  strength_level int not null default 1,
  strength_xp int not null default 0,
  focus_level int not null default 1,
  focus_xp int not null default 0,
  knowledge_level int not null default 1,
  knowledge_xp int not null default 0,
  endurance_level int not null default 1,
  endurance_xp int not null default 0,
  discipline_level int not null default 1,
  discipline_xp int not null default 0,
  charisma_level int not null default 1,
  charisma_xp int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  color text,
  primary_attribute text not null check (primary_attribute in ('strength', 'focus', 'knowledge', 'endurance', 'discipline', 'charisma')),
  secondary_attribute text check (secondary_attribute is null or secondary_attribute in ('strength', 'focus', 'knowledge', 'endurance', 'discipline', 'charisma')),
  level int not null default 1 check (level > 0),
  xp int not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'General',
  xp_value int not null check (xp_value > 0),
  points_value int not null default 0 check (points_value >= 0),
  attribute_bonus text check (attribute_bonus in ('strength', 'focus', 'knowledge', 'endurance', 'discipline', 'charisma')),
  attribute_xp_rewards jsonb not null default '{}'::jsonb,
  skill_id uuid references public.skills(id) on delete set null,
  skill_xp_reward int not null default 0 check (skill_xp_reward >= 0),
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

alter table public.profiles add column if not exists avatar text not null default 'adventurer';
alter table public.profiles add column if not exists gold int not null default 0;
alter table public.profiles add column if not exists points int not null default 0;
alter table public.profiles add column if not exists discipline int not null default 1;
alter table public.profiles add column if not exists strength_level int not null default 1;
alter table public.profiles add column if not exists strength_xp int not null default 0;
alter table public.profiles add column if not exists focus_level int not null default 1;
alter table public.profiles add column if not exists focus_xp int not null default 0;
alter table public.profiles add column if not exists knowledge_level int not null default 1;
alter table public.profiles add column if not exists knowledge_xp int not null default 0;
alter table public.profiles add column if not exists endurance_level int not null default 1;
alter table public.profiles add column if not exists endurance_xp int not null default 0;
alter table public.profiles add column if not exists discipline_level int not null default 1;
alter table public.profiles add column if not exists discipline_xp int not null default 0;
alter table public.profiles add column if not exists charisma_level int not null default 1;
alter table public.profiles add column if not exists charisma_xp int not null default 0;

update public.profiles set
  strength_level = greatest(strength_level, strength),
  focus_level = greatest(focus_level, focus),
  knowledge_level = greatest(knowledge_level, knowledge),
  endurance_level = greatest(endurance_level, endurance),
  discipline_level = greatest(discipline_level, discipline),
  charisma_level = greatest(charisma_level, charisma);

alter table public.tasks alter column category set default 'General';
alter table public.tasks add column if not exists points_value int not null default 0;
alter table public.tasks add column if not exists is_habit boolean not null default false;
alter table public.tasks add column if not exists habit_days int[];
alter table public.tasks add column if not exists habit_frequency_per_week int;
alter table public.tasks add column if not exists habit_weekly_completions int not null default 0;
alter table public.tasks add column if not exists habit_week_start date;
alter table public.tasks add column if not exists attribute_xp_rewards jsonb not null default '{}'::jsonb;
alter table public.tasks add column if not exists skill_id uuid references public.skills(id) on delete set null;
alter table public.tasks add column if not exists skill_xp_reward int not null default 0;

alter table public.tasks drop constraint if exists tasks_attribute_bonus_check;
alter table public.tasks
  add constraint tasks_attribute_bonus_check
  check (attribute_bonus is null or attribute_bonus in ('strength', 'focus', 'knowledge', 'endurance', 'discipline', 'charisma'));

alter table public.tasks drop constraint if exists tasks_skill_xp_reward_check;
alter table public.tasks add constraint tasks_skill_xp_reward_check check (skill_xp_reward >= 0);

insert into public.skills (user_id, name, description, primary_attribute)
select distinct
  t.user_id,
  t.category,
  'Migrated from legacy category label',
  'discipline'
from public.tasks t
where coalesce(t.category, '') <> ''
on conflict (user_id, name) do nothing;

update public.tasks t
set skill_id = s.id
from public.skills s
where t.user_id = s.user_id
  and lower(t.category) = lower(s.name)
  and t.skill_id is null;

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
alter table public.skills enable row level security;
alter table public.tasks enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "profiles owner" on public.profiles;
create policy "profiles owner"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "skills owner" on public.skills;
create policy "skills owner"
  on public.skills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

create table if not exists public.custom_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  cost_gold int not null default 0 check (cost_gold >= 0),
  cost_points int not null default 0 check (cost_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  cost_gold int not null default 0 check (cost_gold >= 0),
  cost_points int not null default 0 check (cost_points >= 0),
  item_type text not null check (item_type in ('consumable', 'cosmetic', 'title', 'unlockable')),
  rarity text,
  color text,
  is_stackable boolean not null default false,
  is_consumable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shop_item_id uuid references public.shop_items(id) on delete cascade,
  reward_id uuid references public.custom_rewards(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 0),
  is_active boolean not null default false,
  is_main_title boolean not null default false,
  acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((shop_item_id is not null) <> (reward_id is not null))
);

create unique index if not exists inventory_items_user_shop_idx on public.inventory_items(user_id, shop_item_id) where shop_item_id is not null;
create unique index if not exists inventory_items_user_reward_idx on public.inventory_items(user_id, reward_id) where reward_id is not null;

create table if not exists public.inventory_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  action text not null,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.custom_rewards enable row level security;
alter table public.shop_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_history enable row level security;

drop policy if exists "custom rewards owner" on public.custom_rewards;
create policy "custom rewards owner" on public.custom_rewards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "shop items read" on public.shop_items;
create policy "shop items read" on public.shop_items for select using (user_id is null or auth.uid() = user_id);
drop policy if exists "shop items owner write" on public.shop_items;
create policy "shop items owner write" on public.shop_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "inventory owner" on public.inventory_items;
create policy "inventory owner" on public.inventory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "inventory history owner" on public.inventory_history;
create policy "inventory history owner" on public.inventory_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
