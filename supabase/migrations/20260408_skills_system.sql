-- Skills system rollout (run once on existing projects)

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

alter table public.tasks alter column category set default 'General';
alter table public.tasks add column if not exists skill_id uuid references public.skills(id) on delete set null;
alter table public.tasks add column if not exists skill_xp_reward int not null default 0;
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

alter table public.skills enable row level security;

drop policy if exists "skills owner" on public.skills;
create policy "skills owner"
  on public.skills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
