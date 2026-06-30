-- =============================================================================
-- Garment slot classification — schema
-- Migration: 005_garment_slot.sql
--
-- Replaces the outfit-suggestion algorithm's regex-based top/bottom/dress/
-- outerwear guessing (see mobile/lib/outfit/suggestOutfit.ts, flagged as a
-- known limitation in PR #12) with a real column populated by Claude Vision
-- at photo-analysis time, the same pattern already used for `category`.
--
-- Existing rows are left NULL — see the migration note in the cleanup-batch
-- PR description for why a keyword backfill was not run.
-- =============================================================================

alter table public.clothing_items
  add column if not exists garment_slot text;

alter table public.clothing_items
  add constraint clothing_items_garment_slot_check
  check (
    garment_slot in ('top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory', 'bag', 'na')
    or garment_slot is null
  );
