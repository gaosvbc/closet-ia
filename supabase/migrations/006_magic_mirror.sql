-- =============================================================================
-- Magic Mirror (Espejo Mágico) — daily usage tracking
-- Migration: 006_magic_mirror.sql
--
-- Hard cost-control guardrail for the Elite-only Gemini Live conversational
-- styling feature: 5 minutes of active session time per user per day. The
-- seconds_used counter is incremented server-side via a heartbeat every
-- 10-15s during an active session (not just at session end), so a crashed
-- or force-closed app cannot bypass the daily cap.
-- =============================================================================

create table if not exists magic_mirror_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  usage_date date not null default current_date,
  seconds_used integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, usage_date)
);

alter table magic_mirror_usage enable row level security;

create policy "Users manage own usage" on magic_mirror_usage
  for all using (auth.uid() = user_id);

-- Logged per session for cost visibility against the 5min/day estimate
-- (video tokens @258/s + audio-in @32/s + audio-out @25/s, Gemini Flash
-- Live rates) — surfaced in a future admin dashboard, not used by the app
-- itself to enforce anything.
alter table magic_mirror_usage add column if not exists estimated_cost_usd numeric;
