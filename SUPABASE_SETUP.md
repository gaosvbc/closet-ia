# Supabase Setup

AtelIA runs **fully without Supabase** in fallback mode (every
write is logged to the server console). Follow this guide to connect a real
backend so signups, body profiles, votes, and events persist and the `/admin`
dashboard shows live data.

> ⏱ Takes about 10 minutes.

---

## 1. Create a project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Choose a strong database password and a region close to your users.
3. Wait for the project to finish provisioning.

## 2. Get your keys

In the Supabase dashboard go to **Project Settings → API** and copy:

| Value | Used as | Exposed to browser? |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | ✅ yes (safe) |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ yes (safe) |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` | ❌ **NEVER** |

> ⚠️ **The `service_role` key bypasses all Row Level Security.** It must only
> ever live on the server. Never prefix it with `NEXT_PUBLIC_`, never log it,
> and never send it to the browser. In this project it is read only inside
> `lib/supabase.ts` and `lib/admin.ts`, both of which run server-side.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=<use openssl rand -hex 24 to generate>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `.env.local` is git-ignored. **Never commit it.**

## 4. Run the migrations

### Option A — SQL editor (no CLI)

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste and run, in order:
   - [`supabase/migrations/001_vct_v2.sql`](./supabase/migrations/001_vct_v2.sql)
     — landing-page capture tables.
   - [`supabase/migrations/002_vision_ai.sql`](./supabase/migrations/002_vision_ai.sql)
     — wardrobe + AI clothing recognition tables.
   - [`supabase/migrations/003_auth.sql`](./supabase/migrations/003_auth.sql)
     — real auth profile columns.
   - [`supabase/migrations/004_calendar_outfit.sql`](./supabase/migrations/004_calendar_outfit.sql)
     — Google Calendar connection flag + `worn_outfits` wear-history table.
   - [`supabase/migrations/005_garment_slot.sql`](./supabase/migrations/005_garment_slot.sql)
     — `garment_slot` column for outfit-suggestion classification.
   - [`supabase/migrations/006_magic_mirror.sql`](./supabase/migrations/006_magic_mirror.sql)
     — `magic_mirror_usage` daily time-cap tracking table (Elite plan only).

### Option B — Supabase CLI

```bash
npm install -g supabase
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

## 5. Tables created

**`001_vct_v2.sql`**: `leads`, `body_profiles`, `survey_responses`,
`feature_votes`, `price_votes`, `page_events`. RLS is enabled on all six.

**`002_vision_ai.sql`**: `user_profiles` (subscription plan tier per user),
`clothing_items` (the wardrobe catalogue, including the AI-derived columns
below), `vision_api_usage` (Claude Vision cost log). RLS is enabled on all
three, scoped to `auth.uid()`.

| `clothing_items` column | Added by | Notes |
| --- | --- | --- |
| `type`, `color`, `category` | Essential plan | Always populated |
| `material`, `pattern`, `season`, `formality` | Pro plan | `null` for Essential |
| `ideal_temp_min`, `ideal_temp_max`, `occasions`, `style_descriptors`, `pairing_suggestions` | Elite plan | `null` for Essential/Pro |
| `analysis_tier` | — | Which tier actually produced the row, default `'essential'` |
| `garment_slot` | — | Outfit-suggestion role (`top`/`bottom`/`dress`/etc.), AI-classified, `null` on existing rows until re-analyzed |

**`006_magic_mirror.sql`**: `magic_mirror_usage` — one row per user per
calendar day, `seconds_used` capped at 300 (5 min) server-side, plus
`estimated_cost_usd` for spend visibility. RLS scoped to `auth.uid()`.

## 5a. Claude Vision (AI clothing recognition)

`/api/analyze-clothing` uses the Anthropic API (`claude-haiku-4-5-20251001`)
to identify a clothing item from a photo. Analysis depth — Essential / Pro /
Elite — is controlled entirely by prompt engineering based on the user's
plan, resolved server-side via `getUserPlanTier()` against `user_profiles`.

1. Get a key at [console.anthropic.com](https://console.anthropic.com).
2. Add it to `.env.local` as `ANTHROPIC_API_KEY`.

> ⚠️ **This key must be server-side only, never exposed to the client.** It
> is read only inside `lib/ai/clothing-analysis.ts`, which is only ever
> imported from the `/api/analyze-clothing` route. Never prefix it with
> `NEXT_PUBLIC_`.

Without this key configured, `/api/analyze-clothing` returns a 500 and the
client falls back to an empty, manually-fillable form — saving an item is
never blocked by analysis failing. Every successful call is logged to
`vision_api_usage` with token counts and an estimated cost (Haiku 4.5 rates:
$1 / $5 per million input / output tokens).

## 5b. Storage bucket: clothing photos

`clothing_items.image_url` stores photos of each garment. These photos live
in the Supabase Storage bucket **`clothing-photos`**, created by migration
`007_storage_rls.sql`.

### Bucket configuration

| Setting | Value | Reason |
| --- | --- | --- |
| Bucket ID / name | `clothing-photos` | Matches the path used in code |
| Visibility | **Private** (not public) | Photos can include personal context beyond the garment (home interiors, reflections, other people). A public bucket exposes every photo to anyone who knows or guesses the URL. |
| File size limit | 5 MB per object | Prevents oversized uploads; the API route also rejects base64 > 6 MB before forwarding to Anthropic. |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` | |

### How photos are stored and read

**Uploading**: files are organized as `{user_id}/{uuid}.jpg` (the `{user_id}`
prefix is enforced by the Storage RLS policies — see below). The mobile app
calls `supabase.storage.from('clothing-photos').upload(path, file)` from the
authenticated client.

**Reading**: photos are **never served via a permanent public URL**. Every
time a photo is displayed, the server or mobile client calls:

```ts
const { data } = await supabase.storage
  .from('clothing-photos')
  .createSignedUrl(`${userId}/${filename}`, 3600); // expires in 1 hour
// store data.signedUrl in component state, never in the DB
```

`clothing_items.image_url` stores only the **storage path** (e.g.
`{user_id}/{uuid}.jpg`), not the full URL. The signed URL is generated at
display time and is never cached to disk or persisted.

### Storage RLS policies (migration 007)

The bucket is private by default, so any unauthenticated request returns 403.
Additionally, four explicit policies on `storage.objects` restrict each
authenticated user to their own folder:

| Policy | Operation | Rule |
| --- | --- | --- |
| `users_upload_own_photos` | INSERT | `(storage.foldername(name))[1] = auth.uid()::text` |
| `users_read_own_photos` | SELECT | same |
| `users_update_own_photos` | UPDATE | same |
| `users_delete_own_photos` | DELETE | same |

This means user A can never read, upload, update, or delete any object in
user B's folder — even if they know the exact path.

### Quick audit check

```sql
-- Confirm the bucket is private
select id, name, public from storage.buckets where id = 'clothing-photos';
-- public column must be false

-- Confirm RLS policies exist
select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like '%photos%';
```

## 5c. Gemini Live (Magic Mirror — Elite plan beta)

The Magic Mirror ("Espejo Mágico") is a real-time conversational styling
session — the camera sees the user, they talk by voice, AtelIA responds by
voice — built on Google's Gemini Live API. This is a **different Google
product from the Calendar integration above** (Gemini API vs. Google
Calendar API), so it needs its own key, even though both can live under the
same Google Cloud account.

1. Get a key at [Google AI Studio](https://ai.google.dev) (not Google Cloud
   Console — Gemini API keys are issued from AI Studio).
2. Add it to `mobile/.env` as `EXPO_PUBLIC_GEMINI_API_KEY`.

This key is intentionally bundled client-side (`EXPO_PUBLIC_*`), the same
pattern already used for the OpenWeather and Google Calendar client-side
keys — the mobile app talks to Gemini Live directly over WebSocket, there is
no backend proxy. The real cost control is not key secrecy but the
server-tracked 5-minutes-per-day cap in `magic_mirror_usage` (migration
006): the client heartbeats elapsed seconds to that table every 10-15s
during a session, and a new session is refused once today's `seconds_used`
reaches 300 — checked server-side before the camera ever opens, so closing
and reopening the app cannot extend the limit.

Without this key configured, the Magic Mirror entry point is hidden
entirely (it never appears on the Hoy screen, even for Elite users) rather
than showing a broken feature.

The feature itself is also gated to `user_profiles.plan_tier === 'elite'`
— Pro/Essential users never see the entry point, key configured or not.

## 6. Row Level Security & policies

### The model

- ✅ **Anonymous INSERT is allowed** — the public site can submit signups,
  profiles, votes, and events using the anon key.
- 🚫 **Anonymous SELECT / UPDATE / DELETE are blocked** — RLS is enabled and
  there is no permissive policy for those actions, so the anon role gets zero
  rows back. Nobody can read your leads or body profiles from the browser.
- 🔓 **The `service_role` bypasses RLS entirely** — so the server-side admin
  dashboard (`/admin`) can still read aggregates and recent leads.

### Policies

Every table gets one anon INSERT policy, e.g.:

```sql
create policy "anon_insert_leads"
  on public.leads for insert to anon with check (true);
```

**`body_profiles` is stricter.** Its insert policy enforces consent:

```sql
create policy "anon_insert_body_profiles_with_consent"
  on public.body_profiles for insert to anon
  with check (
    consent_body_data = true
    or (height_cm is null and weight_kg is null)
  );
```

This means a row containing height or weight is **rejected** unless
`consent_body_data = true`. The same rule is also a table-level `CHECK`
constraint (`body_measurements_require_consent`), so even the service role
cannot store measurements without recording consent. Defense in depth.

### Quick check

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'leads','body_profiles','survey_responses',
    'feature_votes','price_votes','page_events'
  );
```

Every row should show `rowsecurity = true`.

---

## 7. Body data & encryption at rest

Height and weight are sensitive. This project protects them in layers:

1. **Consent first.** The app only sends measurements when the user ticks the
   explicit consent box during onboarding. The API route drops height/weight if
   consent is absent, and the DB rejects them anyway (constraint + RLS).
2. **No anonymous reads.** RLS guarantees measurements can never be read with
   the anon key — only the server-side service role can read them, and only for
   the admin dashboard (which shows distributions, not individual measurements).
3. **Encrypted at rest by default.** Supabase's managed Postgres encrypts all
   data at rest with AES-256. No configuration required.

### Optional hardening — column-level encryption

For an extra layer beyond platform encryption, you can encrypt height/weight at
the column level with `pgcrypto` and a key held outside the database (e.g. in
Supabase Vault). Sketch:

```sql
-- Store an encrypted text column instead of plain numerics, and decrypt
-- server-side with a key from Vault. This trades off the ability to aggregate
-- measurements in SQL, so weigh it against your analytics needs.
-- See: https://supabase.com/docs/guides/database/vault
```

This MVP relies on consent-gating + RLS + platform encryption by default, which
is appropriate for validation. Add column-level encryption before collecting
measurements at scale.

## 8. Test it

1. Restart the dev server: `npm run dev`.
2. Complete `/onboarding` (tick the consent box) or submit `/waitlist`.
3. In Supabase, open **Table Editor → leads** / **body_profiles** and confirm
   rows appear.
4. Visit `/admin`, sign in with `ADMIN_PASSWORD`, and confirm metrics populate.

---

## How writes flow

```
Browser form ──POST──▶ Next.js API route ──service role──▶ Supabase (RLS)
                         (server only)                     row inserted
```

All inserts go through server-side API routes (`/api/leads`, `/api/onboarding`,
`/api/feature-vote`, `/api/price-vote`, `/api/event`) using the service-role
client. The anon INSERT policies exist as defense-in-depth and to document the
intended access model.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Forms succeed but nothing in tables | Env vars missing → app is in fallback mode. Check `.env.local` and restart. |
| `/admin` shows "Connect Supabase" | `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` not set. |
| Body profile inserts rejected | Measurements present without `consent_body_data = true`. Expected behaviour. |
| Inserts rejected generally | Migration not run, or RLS insert policy missing. Re-run the migration. |
| `/admin` says "not configured" | `ADMIN_PASSWORD` not set. |
