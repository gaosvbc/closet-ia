-- =============================================================================
-- Real authentication — schema
-- Migration: 003_auth.sql
--
-- Replaces the mock mobile auth flow with real Supabase Auth. This migration:
--
--   1. Extends user_profiles (created in 002_vision_ai.sql) with the
--      onboarding/profile columns the GOAL spec asks for, rather than
--      creating a separate `profiles` table — user_profiles already holds
--      plan_tier and is already referenced by lib/supabase/user.ts, so a
--      second per-user table would just create a confusing two-table model.
--   2. Adds the missing INSERT policy on user_profiles. 002_vision_ai.sql
--      only added SELECT/UPDATE, with no way for a newly-registered user to
--      create their own row — that's a gap, not a deliberate restriction.
--   3. Creates the `looks` table from scratch (it didn't exist before),
--      owner-scoped via auth.uid() = user_id from day one.
--
-- Note on the migration's "tighten RLS on clothing_items / vision_api_usage"
-- instruction: both tables were already built in 002_vision_ai.sql with
-- `to authenticated` + `auth.uid() = user_id` policies and no anon-insert
-- policies at all (see comments there). There is nothing to tighten — this
-- migration documents that rather than re-issuing redundant policies.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- user_profiles — add onboarding/profile columns
-- -----------------------------------------------------------------------------
alter table public.user_profiles
  add column if not exists full_name           text,
  add column if not exists email               text,
  add column if not exists gender              text,
  add column if not exists height_cm           numeric,
  add column if not exists weight_kg           numeric,
  add column if not exists body_type           text,
  add column if not exists fit_preference      text,
  add column if not exists gender_expression   text,
  add column if not exists occupation          text,
  add column if not exists preferred_brands    text[],
  add column if not exists acquisition_source  text,
  add column if not exists onboarding_completed boolean not null default false;

create policy "users_insert_own_profile"
  on public.user_profiles for insert to authenticated
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- looks — saved outfit combinations, owner-scoped from creation
-- -----------------------------------------------------------------------------
create table if not exists public.looks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  look_date   text,
  item_ids    text[],
  favorited   boolean default false,
  created_at  timestamptz default now()
);

create index if not exists looks_user_id_idx on public.looks (user_id);

alter table public.looks enable row level security;

create policy "users_select_own_looks"
  on public.looks for select to authenticated
  using (auth.uid() = user_id);

create policy "users_insert_own_looks"
  on public.looks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users_update_own_looks"
  on public.looks for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_delete_own_looks"
  on public.looks for delete to authenticated
  using (auth.uid() = user_id);
