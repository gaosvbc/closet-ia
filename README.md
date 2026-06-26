# Visual Closet Tracker — Validation MVP

An AI-powered wardrobe assistant. Photograph your clothes once and get the
perfect outfit every morning — based on the weather and what's on your calendar.

This repository is the **validation MVP**: a polished landing page, an
interactive demo, a waitlist with onboarding survey, feature voting, three
pricing plans, and a password-protected admin dashboard. It is designed to
**run live today** and connect a real backend later by only adding environment
variables.

> Suggestions are inspiration only — never instructions. All style decisions
> remain yours. No images are stored in this version.

---

## Highlights

- **Runs with zero configuration.** No Supabase, no keys, no login required.
  Every form works in *fallback mode*, logging to the server console.
- **Production-ready when you are.** Add environment variables and run one SQL
  migration to go live with a real Supabase backend.
- **Security-first.** Zod validation on every form, a honeypot on the waitlist,
  Row Level Security on every table, and the service-role key never touches the
  browser.
- **Clean, gender-neutral design.** White space, near-black text, a single warm
  gold accent, Playfair Display + Inter. Inspired by The Row, COS, and Everlane.

## Tech stack

| | |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Icons | Lucide (thin line icons) |
| Validation | Zod |
| Backend (optional) | Supabase |

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page — full copy and design |
| `/demo` | Interactive simulated outfit experience |
| `/waitlist` | Waitlist capture + 4-question onboarding survey |
| `/pricing` | Full pricing page (also embedded on the landing page) |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/disclaimer` | Disclaimer |
| `/admin` | Password-protected validation dashboard |

API routes: `/api/leads`, `/api/feature-vote`, `/api/price-vote`, `/api/event`.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — the whole site
works without any environment variables.

### Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## Fallback mode vs. connected mode

| | Fallback mode (default) | Connected mode |
| --- | --- | --- |
| Env vars | none required | Supabase + `ADMIN_PASSWORD` |
| Form submissions | logged to server console | inserted into Supabase tables |
| Waitlist message | "You're on the list. We'll be in touch soon." | same |
| `/admin` | shows setup instructions | shows live metrics |

The user experience is identical in both modes — the app never reveals which
backend state it's in.

## Connect Supabase

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for the full 10-minute guide.
Short version:

1. `cp .env.example .env.local` and fill in your Supabase keys + `ADMIN_PASSWORD`.
2. Run `supabase/migrations/001_vct_validation.sql` in the Supabase SQL editor.
3. Restart `npm run dev`.

### Environment variables

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # SERVER-ONLY — never expose client-side
ADMIN_PASSWORD=                # gates the /admin route
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`.env.local` is git-ignored and must never be committed.

---

## Deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel, **Import Project** and select the repo. Vercel auto-detects
   Next.js — no build configuration needed.
3. Add the environment variables from `.env.example` under
   **Project Settings → Environment Variables**. (You can deploy with none of
   them and the site will run in fallback mode.)
4. Deploy. Set `NEXT_PUBLIC_APP_URL` to your production URL.

> Keep `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` as plain (server)
> environment variables — do **not** prefix them with `NEXT_PUBLIC_`.

---

## Security notes

- **No secrets in the repo.** All credentials come from environment variables;
  `.env.local` is git-ignored.
- **Service-role key is server-only.** It is read exclusively in
  `lib/supabase.ts` and `lib/admin.ts`, both server-side.
- **Validation everywhere.** Every API route validates its body with Zod;
  emails are format-checked and numbers are bounded.
- **Bot protection.** The waitlist form has a hidden honeypot field; filled
  submissions are silently discarded.
- **RLS on every table.** Anonymous clients may INSERT but never SELECT.
- **No raw errors to users.** API routes return friendly messages only.
- **No images, no body data, no precise location** are collected or stored.

## What this is *not* (yet)

Deliberately out of scope for the validation phase: real AI vision, camera or
photo upload, real weather/calendar integration, payments, user accounts, push
notifications, and any native app. See the roadmap voting on the landing page.

## Project structure

```
app/
  api/            # leads, feature-vote, price-vote, event routes
  admin/          # password-gated dashboard + server actions
  demo/  pricing/  waitlist/  privacy/  terms/  disclaimer/
  layout.tsx  page.tsx  globals.css
components/        # SiteNav, SiteFooter, Pricing, FeatureVoting, WaitlistForm, …
lib/              # supabase, admin, validation (zod), constants, analytics, api
supabase/
  migrations/001_vct_validation.sql
```

---

Built as a validation MVP. Connect a backend, drive traffic, measure against
[VALIDATION_METRICS.md](./VALIDATION_METRICS.md), and decide.
