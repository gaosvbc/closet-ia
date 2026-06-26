# Supabase Setup

Visual Closet Tracker runs **fully without Supabase** in fallback mode (every
write is logged to the server console). Follow this guide to connect a real
backend so signups, votes, and events persist and the `/admin` dashboard shows
live data.

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

Copy the example file and fill in the values:

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

You have two options.

### Option A — SQL editor (no CLI)

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of
   [`supabase/migrations/001_vct_validation.sql`](./supabase/migrations/001_vct_validation.sql).
3. Click **Run**.

### Option B — Supabase CLI

```bash
npm install -g supabase
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

## 5. Verify Row Level Security

The migration creates five tables and enables RLS on all of them:

`leads`, `survey_responses`, `feature_votes`, `price_votes`, `page_events`.

### Policies created

For **every** table there is exactly one policy:

```sql
create policy "anon_insert_<table>"
  on public.<table> for insert to anon with check (true);
```

This means:

- ✅ **Anonymous INSERT is allowed** — the public site can submit signups,
  votes, and events using the anon key.
- 🚫 **Anonymous SELECT / UPDATE / DELETE are blocked** — because RLS is
  enabled and there is no permissive policy for those actions, the anon role
  gets zero rows back. Nobody can read your leads from the browser.
- 🔓 **The `service_role` bypasses RLS entirely** — so the server-side admin
  dashboard (`/admin`) can still read aggregates and recent leads.

### Quick check

In the SQL editor, confirm RLS is on:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('leads','survey_responses','feature_votes','price_votes','page_events');
```

Every row should show `rowsecurity = true`.

## 6. Test it

1. Restart the dev server: `npm run dev`.
2. Submit the waitlist form on `/waitlist`.
3. In Supabase, open **Table Editor → leads** and confirm the row appears.
4. Visit `/admin`, sign in with `ADMIN_PASSWORD`, and confirm the metrics
   populate.

---

## How writes flow

```
Browser form ──POST──▶ Next.js API route ──service role──▶ Supabase (RLS)
                         (server only)                     row inserted
```

All inserts go through server-side API routes (`/api/leads`,
`/api/feature-vote`, `/api/price-vote`, `/api/event`) using the service-role
client. The anon INSERT policies exist as defense-in-depth and to document the
intended access model.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Forms succeed but nothing in tables | Env vars missing → app is in fallback mode. Check `.env.local` and restart. |
| `/admin` shows "Connect Supabase" | `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` not set. |
| Inserts rejected | Migration not run, or RLS insert policy missing. Re-run the migration. |
| `/admin` says "not configured" | `ADMIN_PASSWORD` not set. |
