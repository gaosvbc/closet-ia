# Visual Closet Tracker — V2 MVP

**Dressed for your body. Your day. Your life.**

An AI-powered wardrobe assistant that knows your measurements, your calendar,
and your clothes — and puts them together every morning without you lifting a
finger. Unlike social, trend-led closet apps, Visual Closet Tracker is
personal, private, and intelligent, with a luxury European design sensibility.

This repository is the **validation MVP**: a polished landing page, an
interactive body-intelligence demo, a 5-step onboarding flow, a waitlist with
survey, feature voting, three pricing plans, and a password-protected admin
dashboard. It **runs live today** and connects a real backend later by only
adding environment variables.

> Suggestions are inspiration only — never instructions. All style decisions
> remain yours. No images are stored in this version, and body measurements are
> only stored with your explicit consent.

---

## What makes it different

- **Body intelligence (our #1 differentiator).** Height, weight, body type, and
  fit preference power suggestions sized and styled for *your* frame — with fit
  notes on every look.
- **Calendar-aware styling.** Read the day ahead — a meeting, a dinner, a gym
  session — and dress for it. (Simulated in this MVP.)
- **Cost-per-wear intelligence.** Know which clothes are worth their price.
- **Truly gender-neutral.** No gendered language, no pink/blue coding, garment
  examples mixed evenly.
- **Private by design.** No social feed. No public profiles.

## Highlights

- **Runs with zero configuration.** No Supabase, no keys, no login. Every form
  works in *fallback mode*, logging to the server console.
- **Production-ready when you are.** Add environment variables and run one SQL
  migration to go live.
- **Security-first.** Zod validation everywhere, a honeypot on forms,
  consent-gated body data, RLS on every table, and the service-role key never
  touches the browser.
- **Architectural, minimal design.** Pure white, near-black text, a single warm
  stone accent, Playfair Display + Inter, 2px radii, no shadows, no gradients.
  Inspired by COS, The Row, Arket, and Totême.

## Tech stack

| | |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Icons | Lucide (stroke-width 1) |
| Validation | Zod |
| Backend (optional) | Supabase |

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page — full copy, difference + comparison sections |
| `/demo` | Interactive body-intelligence outfit simulation |
| `/onboarding` | 5-step body profile setup (simulation only) |
| `/waitlist` | Waitlist capture + 4-question survey / confirmation |
| `/pricing` | Full pricing comparison (also embedded on the landing page) |
| `/privacy` | Privacy policy (incl. body-data handling) |
| `/terms` | Terms of service |
| `/disclaimer` | Disclaimer |
| `/admin` | Password-protected validation dashboard |

API routes: `/api/leads`, `/api/onboarding`, `/api/feature-vote`,
`/api/price-vote`, `/api/event`.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The whole site works
without any environment variables.

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
| Confirmation message | "You're on the list. We'll be in touch." | same |
| `/admin` | shows setup instructions | shows live metrics |

The user experience is identical in both modes — the app never reveals which
backend state it's in.

## Connect Supabase

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for the full guide. Short
version:

1. `cp .env.example .env.local` and fill in your Supabase keys + `ADMIN_PASSWORD`.
2. Run `supabase/migrations/001_vct_v2.sql` in the Supabase SQL editor.
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
   them and the site runs in fallback mode.)
4. Deploy. Set `NEXT_PUBLIC_APP_URL` to your production URL.

> Keep `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` as plain (server)
> environment variables — do **not** prefix them with `NEXT_PUBLIC_`.

---

## Security notes — especially body data

- **No secrets in the repo.** All credentials come from environment variables;
  `.env.local` is git-ignored.
- **Service-role key is server-only.** Read exclusively in `lib/supabase.ts` and
  `lib/admin.ts`, both server-side.
- **Body data is consent-gated.** Height and weight are only sent and stored
  when the user explicitly ticks the consent box in onboarding. Without consent,
  measurements are dropped both client-side and server-side, and a database
  `CHECK` constraint plus an RLS `WITH CHECK` policy reject any measurement row
  that lacks consent.
- **Encrypted at rest.** Supabase encrypts all stored data at rest (AES-256) by
  default. Body data is additionally shielded by RLS (no anonymous reads) and is
  served only to the admin via the server-side service role. See
  `SUPABASE_SETUP.md` for an optional column-level encryption hardening step.
- **Validation everywhere.** Every API route validates with Zod; emails are
  format-checked, height is bounded to 50–250 cm and weight to 20–300 kg.
- **Bot protection.** Waitlist and onboarding forms include a hidden honeypot;
  filled submissions are silently discarded.
- **RLS on every table.** Anonymous clients may INSERT but never SELECT.
- **No raw errors to users.** API routes return friendly messages only.
- **No images, no precise location** are collected or stored.

## What this is *not* (yet)

Deliberately out of scope for the validation phase: real AI vision, camera or
photo upload, real weather/calendar integration, payments, user accounts, push
notifications, native apps, and social/community features. See the roadmap
voting on the landing page.

## Project structure

```
app/
  api/            # leads, onboarding, feature-vote, price-vote, event
  admin/          # password-gated dashboard + server actions
  demo/  onboarding/  pricing/  waitlist/  privacy/  terms/  disclaimer/
  layout.tsx  page.tsx  globals.css
components/        # SiteNav, SiteFooter, Pricing, FeatureVoting, Comparison,
                  # WaitlistForm, GarmentCard, OutfitSuggestionCard, LegalLayout
lib/              # supabase, admin, validation (zod), constants, analytics, api
supabase/
  migrations/001_vct_v2.sql
```

---

Built as a validation MVP. Connect a backend, drive traffic, measure against
[VALIDATION_METRICS.md](./VALIDATION_METRICS.md), and decide.
