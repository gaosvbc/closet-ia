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
ADMIN_PASSWORD=choose-a-strong-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `.env.local` is git-ignored. **Never commit it.**

## 4. Run the migration

### Option A — SQL editor (no CLI)

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of
   [`supabase/migrations/001_vct_v2.sql`](./supabase/migrations/001_vct_v2.sql).
3. Click **Run**.

### Option B — Supabase CLI

```bash
npm install -g supabase
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

## 5. Tables created

`leads`, `body_profiles`, `survey_responses`, `feature_votes`, `price_votes`,
`page_events`. RLS is enabled on all six.

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
