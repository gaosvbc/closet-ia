# AtelIA — Mobile (Expo)

The native mobile app for AtelIA, built with **Expo + React
Native + Expo Router** and TypeScript (strict). It runs immediately in **mock
mode** with the bundled demo data — no backend or credentials required.

> This is the mobile sibling of the web app at the repo root. It lives in
> `mobile/` so both projects coexist.

## Run it

```bash
cd mobile
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code
with **Expo Go** on your phone.

## Design system

| Token | Value |
| --- | --- |
| Background / surface | `#FBFAF7` / `#F7F4EF` |
| Text | `#171717` / `#8C8580` |
| Accent (wine) | `#8B1524` — CTAs, active tab, camera button, favorites |
| Gold | `#C8A45D` — accessories only |
| Display font | Cormorant Garamond (500 / 500 italic / 600) |
| Body font | Inter (400 / 500 / 600) |
| Icons | `@expo/vector-icons` Feather (thin line) |

## Screens

- **Onboarding** (5): welcome, slide 2, slide 3, body profile, register
- **Tabs** (4): Hoy, Armario, Looks, Perfil — with a centre camera FAB
- **Camera** modal (full-screen scanner)

Navigation: on launch, `app/index.tsx` checks `AsyncStorage['onboarding_complete']`
and routes to onboarding or the tabs.

## Mock mode vs. Supabase

The app runs fully on `lib/mock-data.ts` when no Supabase env vars are set
(`lib/supabase.ts` exposes `isMockMode`). To connect a backend:

```bash
cp .env.example .env
# then fill in:
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Only `EXPO_PUBLIC_*` variables are exposed to the app at runtime.

## Project layout

```
app/
  _layout.tsx            # fonts + splash + root stack
  index.tsx              # onboarding redirect
  onboarding/            # 01-que-usas .. 10-gracias
  (tabs)/                # _layout (tab bar + camera FAB), index, armario, looks, perfil, scan
  camera.tsx             # full-screen camera modal
components/              # ui, home, wardrobe, looks, camera, onboarding
constants/               # colors, typography
lib/                     # supabase, mock-data, storage
types/                   # shared TypeScript types
```

## Scripts

```bash
npm start          # expo start
npm run android    # expo start --android
npm run ios        # expo start --ios
npm run typecheck  # tsc --noEmit
```
