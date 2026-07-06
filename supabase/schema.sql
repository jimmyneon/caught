-- Caught app — Supabase schema
-- Run this in the Supabase SQL editor

-- ============================================================
-- 1. CATCHES TABLE
-- ============================================================
create table if not exists public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at bigint not null,
  species text,
  weight_kg double precision,
  photo text,
  method text,
  water_type text,
  notes text,
  kept boolean,
  complete boolean not null default false,
  lat double precision,
  lon double precision,
  -- conditions (stored as jsonb for flexibility)
  conditions jsonb,
  -- sync metadata
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  deleted boolean not null default false
);

-- Index for user's catches ordered by date
create index if not exists catches_user_created_idx
  on public.catches (user_id, created_at desc);

-- Index for sync queries
create index if not exists catches_user_updated_idx
  on public.catches (user_id, updated_at desc);

-- ============================================================
-- 2. SETTINGS TABLE
-- ============================================================
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  units text not null default 'metric',
  temp_unit text not null default 'celsius',
  save_location boolean not null default true,
  favourite_species text[] not null default '{}',
  default_water_type text,
  theme text not null default 'dawn',
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
alter table public.catches enable row level security;
alter table public.settings enable row level security;

-- Catches: users can only see/modify their own
create policy "Users can view own catches"
  on public.catches for select
  using (auth.uid() = user_id);

create policy "Users can insert own catches"
  on public.catches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own catches"
  on public.catches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own catches"
  on public.catches for delete
  using (auth.uid() = user_id);

-- Settings: users can only see/modify their own
create policy "Users can view own settings"
  on public.settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own settings"
  on public.settings for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. AUTO-UPDATE updated_at ON CATCHES
-- ============================================================
create or replace function public.update_catch_timestamp()
returns trigger as $$
begin
  new.updated_at := (extract(epoch from now()) * 1000)::bigint;
  return new;
end;
$$ language plpgsql;

drop trigger if exists catches_updated_at on public.catches;
create trigger catches_updated_at
  before update on public.catches
  for each row execute function public.update_catch_timestamp();

-- ============================================================
-- 5. CALENDAR PLANS TABLE
-- ============================================================
create table if not exists public.calendar_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date bigint not null,
  rating text,
  score integer,
  notes text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists calendar_plans_user_idx
  on public.calendar_plans (user_id, plan_date desc);

alter table public.calendar_plans enable row level security;

create policy "Users can view own plans"
  on public.calendar_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on public.calendar_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on public.calendar_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own plans"
  on public.calendar_plans for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. REALTIME PUBLICATION
-- ============================================================
alter publication supabase_realtime add table public.catches;
alter publication supabase_realtime add table public.settings;
alter publication supabase_realtime add table public.calendar_plans;
