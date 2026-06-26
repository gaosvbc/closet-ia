-- =============================================================================
-- Visual Closet Tracker — Validation MVP schema
-- Migration: 001_vct_validation.sql
--
-- Creates the five capture tables and locks them down with Row Level Security:
--   * Anonymous clients may INSERT (the public site writes via these).
--   * Anonymous clients may NOT SELECT (no reading rows from the browser).
--   * The service role (used server-side only) bypasses RLS for the admin
--     dashboard and aggregates.
--
-- Apply via the Supabase SQL editor, or `supabase db push` with the CLI.
-- See SUPABASE_SETUP.md for the full walkthrough.
-- =============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- leads
-- -----------------------------------------------------------------------------
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  first_name      text,
  wardrobe_size   text,
  current_solution text,
  pain_level      integer,
  gender_target   text,
  source          text,
  consent_email   boolean default true,
  created_at      timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- survey_responses
-- -----------------------------------------------------------------------------
create table if not exists public.survey_responses (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid references public.leads(id) on delete set null,
  q1_morning_stress   text,
  q2_wardrobe_pieces  integer,
  q3_minutes_deciding integer,
  q4_would_pay        boolean,
  created_at          timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- feature_votes
-- -----------------------------------------------------------------------------
create table if not exists public.feature_votes (
  id            uuid primary key default gen_random_uuid(),
  email         text,
  feature_key   text not null,
  feature_label text not null,
  created_at    timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- price_votes
-- -----------------------------------------------------------------------------
create table if not exists public.price_votes (
  id                  uuid primary key default gen_random_uuid(),
  email               text,
  plan_selected       text not null,
  billing_preference  text,
  created_at          timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- page_events
-- -----------------------------------------------------------------------------
create table if not exists public.page_events (
  id          uuid primary key default gen_random_uuid(),
  event_name  text not null,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.leads             enable row level security;
alter table public.survey_responses  enable row level security;
alter table public.feature_votes     enable row level security;
alter table public.price_votes       enable row level security;
alter table public.page_events       enable row level security;

-- Anonymous INSERT policies. The anon role may write but never read.
-- (The service role bypasses RLS entirely, so admin reads still work.)

create policy "anon_insert_leads"
  on public.leads for insert to anon with check (true);

create policy "anon_insert_survey_responses"
  on public.survey_responses for insert to anon with check (true);

create policy "anon_insert_feature_votes"
  on public.feature_votes for insert to anon with check (true);

create policy "anon_insert_price_votes"
  on public.price_votes for insert to anon with check (true);

create policy "anon_insert_page_events"
  on public.page_events for insert to anon with check (true);

-- NOTE: We intentionally create NO SELECT/UPDATE/DELETE policies for anon.
-- With RLS enabled and no permissive SELECT policy, anonymous SELECT returns
-- zero rows — exactly the requirement: "Block anonymous SELECT of all rows".
