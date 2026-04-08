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

insert into public.shop_items (user_id, name, description, icon, cost_gold, cost_points, item_type, rarity, color, is_stackable, is_consumable)
values
  (null, 'Energy Drink', 'Kurzer Fokus-Boost für intensive Sessions.', '⚡', 35, 0, 'consumable', 'common', '#06b6d4', true, true),
  (null, 'Focus Potion', 'Belohnung für Deep-Work-Phasen.', '🧪', 60, 10, 'consumable', 'rare', '#0ea5e9', true, true),
  (null, 'Neon Aura', 'Kosmetischer Stil für dein Profil.', '🌌', 180, 0, 'cosmetic', 'epic', '#8b5cf6', false, false),
  (null, 'Scholar', 'Titel für konstantes Lernen.', '📚', 240, 0, 'title', 'rare', '#6366f1', false, false),
  (null, 'Champion', 'Titel für starke Disziplin.', '🏆', 320, 25, 'title', 'legendary', '#f59e0b', false, false),
  (null, 'Disziplinierter', 'Titel für tägliche Routine.', '🛡️', 220, 0, 'title', 'rare', '#22c55e', false, false),
  (null, 'Novize', 'Starter-Titel für neue Helden.', '🧭', 120, 0, 'title', 'common', '#a78bfa', false, false),
  (null, 'Golden Theme', 'Schaltet ein goldenes UI-Theme frei.', '✨', 500, 40, 'unlockable', 'legendary', '#f59e0b', false, false)
on conflict do nothing;
