-- =============================================================================
-- Calendar connection flag + worn-outfit tracking
-- Migration: 004_calendar_outfit.sql
--
-- Adds the columns/tables needed for the real weather/calendar/outfit
-- "Hoy" experience:
--
--   * user_profiles.google_calendar_connected — a boolean flag only.
--     Actual Google OAuth access/refresh tokens are stored exclusively
--     on-device via expo-secure-store and never reach Supabase — this
--     column just lets the UI know whether to show "Conectado".
--   * worn_outfits — a log of what the user marked as worn each day,
--     powering the 14-day repeat-check in the outfit suggestion
--     algorithm and (later) cost-per-wear / repeat-tracker features.
-- =============================================================================

alter table public.user_profiles
  add column if not exists google_calendar_connected boolean default false;

create table if not exists public.worn_outfits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  item_ids    uuid[] not null,
  worn_date   date not null default current_date,
  created_at  timestamptz default now()
);

create index if not exists worn_outfits_user_id_idx on public.worn_outfits (user_id);
create index if not exists worn_outfits_worn_date_idx on public.worn_outfits (worn_date);

alter table public.worn_outfits enable row level security;

create policy "Users manage own worn outfits" on public.worn_outfits
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
