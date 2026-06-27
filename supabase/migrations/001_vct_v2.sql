-- =============================================================================
-- Visual Closet Tracker V2 — schema
-- Migration: 001_vct_v2.sql
--
-- Creates the six capture tables and locks them down with Row Level Security:
--   * Anonymous clients may INSERT (the public site writes via these).
--   * Anonymous clients may NOT SELECT (no reading rows from the browser).
--   * body_profiles additionally enforces a consent check: a row that stores
--     height/weight is only accepted when consent_body_data = true.
--   * The service role (server-side only) bypasses RLS for the admin dashboard.
--
-- Apply via the Supabase SQL editor, or `supabase db push` with the CLI.
-- See SUPABASE_SETUP.md for the full walkthrough, including notes on body-data
-- handling and encryption at rest.
-- =============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- leads
-- -----------------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  first_name    text,
  source        text,
  consent_email boolean default true,
  created_at    timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- body_profiles
-- Body measurements (height_cm, weight_kg) are sensitive. They are only ever
-- written with explicit consent (see the RLS insert policy below). Supabase
-- encrypts all data at rest by default (AES-256); this column data is further
-- protected by RLS so anonymous clients can never read it back.
-- -----------------------------------------------------------------------------
create table if not exists public.body_profiles (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid references public.leads(id) on delete set null,
  height_cm          numeric,
  weight_kg          numeric,
  body_type          text,
  fit_preference     text,
  gender_expression  text,
  biggest_challenge  text,
  consent_body_data  boolean default false,
  created_at         timestamptz default now(),

  -- Defense-in-depth: never allow height/weight to be stored without consent.
  constraint body_measurements_require_consent
    check (
      consent_body_data = true
      or (height_cm is null and weight_kg is null)
    )
);

-- -----------------------------------------------------------------------------
-- survey_responses
-- -----------------------------------------------------------------------------
create table if not exists public.survey_responses (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid references public.leads(id) on delete set null,
  q1_minutes_deciding  text,
  q2_wardrobe_size     text,
  q3_tried_app_before  text,
  q4_would_pay         text,
  created_at           timestamptz default now()
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
alter table public.leads            enable row level security;
alter table public.body_profiles    enable row level security;
alter table public.survey_responses enable row level security;
alter table public.feature_votes    enable row level security;
alter table public.price_votes      enable row level security;
alter table public.page_events      enable row level security;

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

-- body_profiles: anon may insert, but ONLY rows where consent is recorded if
-- any measurement is present. The WITH CHECK mirrors the table constraint so
-- a malformed client can never sneak measurements in without consent.
create policy "anon_insert_body_profiles_with_consent"
  on public.body_profiles for insert to anon
  with check (
    consent_body_data = true
    or (height_cm is null and weight_kg is null)
  );

-- NOTE: We intentionally create NO SELECT/UPDATE/DELETE policies for anon.
-- With RLS enabled and no permissive SELECT policy, anonymous SELECT returns
-- zero rows — exactly the requirement: "Block anonymous SELECT of all rows".
