-- =============================================================================
-- Vision AI clothing recognition — schema
-- Migration: 002_vision_ai.sql
--
-- 001_vct_v2.sql only created the pre-launch landing-page capture tables
-- (leads, body_profiles, survey_responses, feature_votes, price_votes,
-- page_events). This migration adds the first real product tables:
--
--   * user_profiles  — one row per authenticated user, holds the
--                       subscription plan tier used to gate AI analysis depth.
--   * clothing_items — the wardrobe catalogue, including the AI-derived
--                       columns from the Claude Vision integration.
--   * vision_api_usage — a log of every Claude Vision call, for cost
--                         monitoring.
--
-- RLS model: every table is owner-scoped via auth.uid() = user_id (or = id
-- for user_profiles). The service role (server-side only) bypasses RLS, so
-- the analyze-clothing API route and admin tooling can still operate.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- user_profiles
-- -----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  plan_tier   text not null default 'essential'
              check (plan_tier in ('essential', 'pro', 'elite')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "users_select_own_profile"
  on public.user_profiles for select to authenticated
  using (auth.uid() = id);

create policy "users_update_own_profile"
  on public.user_profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- clothing_items
-- Base catalogue columns, plus the tiered AI analysis columns added by the
-- Claude Vision integration (material/pattern/season/formality for Pro,
-- ideal_temp_*/occasions/style_descriptors/pairing_suggestions for Elite).
-- -----------------------------------------------------------------------------
create table if not exists public.clothing_items (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  image_url            text,
  name                 text,
  type                 text,
  color                text,
  category             text check (category in ('top', 'bottom', 'footwear', 'accessory', 'outerwear')),

  -- Pro tier
  material             text,
  pattern              text,
  season               text check (season in ('spring', 'summer', 'fall', 'winter', 'year-round')),
  formality            text check (formality in ('casual', 'business-casual', 'formal', 'athletic')),

  -- Elite tier
  ideal_temp_min         numeric,
  ideal_temp_max         numeric,
  occasions              text[],
  style_descriptors     text[],
  pairing_suggestions   text,

  analysis_tier        text default 'essential' check (analysis_tier in ('essential', 'pro', 'elite')),
  favorited            boolean default false,
  created_at           timestamptz default now()
);

create index if not exists clothing_items_user_id_idx on public.clothing_items (user_id);

alter table public.clothing_items enable row level security;

create policy "users_select_own_clothing_items"
  on public.clothing_items for select to authenticated
  using (auth.uid() = user_id);

create policy "users_insert_own_clothing_items"
  on public.clothing_items for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users_update_own_clothing_items"
  on public.clothing_items for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_delete_own_clothing_items"
  on public.clothing_items for delete to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- vision_api_usage
-- Written only by the server (service role) from the analyze-clothing API
-- route, so there is no anon/authenticated INSERT policy — by default, with
-- RLS enabled and no permissive policy, both roles get zero access.
-- -----------------------------------------------------------------------------
create table if not exists public.vision_api_usage (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  plan_tier           text not null,
  tokens_used         integer,
  estimated_cost_usd  numeric,
  created_at          timestamptz default now()
);

alter table public.vision_api_usage enable row level security;

create policy "users_select_own_vision_usage"
  on public.vision_api_usage for select to authenticated
  using (auth.uid() = user_id);
