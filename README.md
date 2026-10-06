# DuBose Photography — iOS & Android app

A client app for [DuBose Photography](https://www.dubosephotography.com), the Charleston studio known for classic black and white vignetted portraits of children. Built with Expo (React Native) so one codebase ships to the Apple App Store and Google Play.

## What clients can do

| Tab | What it does |
| --- | --- |
| **Home** | Studio hero, quick links, the next upcoming sessions, and an About teaser. |
| **Calendar** | Every Spring and Fall travel session by city, with hostess contact, sitting fee, minimum order, open 15-minute times, and a request form (or waitlist when a city is full). |
| **Gallery** | The studio's portfolio, filterable by single images, composites, and siblings, with a full-screen viewer. |
| **My Proofs** | Passwordless client sign-in (one-time email code). Clients see their proof galleries, swipe through proofs full screen, mark favorites, open the price sheet, and send a print order. |
| **More** | About DuBose, Sessions & Pricing, Payments, Contact (tap to call, email, or open maps), Host a Session application, My Reservations, website, blog, and Facebook. |

## Project layout

```
src/app/              Screens (Expo Router file-based routes)
  (tabs)/             Home, Calendar, Gallery, My Proofs, More
  session/[id].tsx    Session detail with time slots
  session/book.tsx    Reservation / waitlist form
  gallery/[id].tsx    Proof grid for one gallery
  proof/[id].tsx      Full-screen swipeable proof viewer
  order.tsx           Print order form
  login.tsx           One-time-code sign in
  about, pricing, hostess, contact, payments, my-bookings
src/components/       Reusable UI (buttons, cards, fields, session card, ...)
src/lib/content.ts    All studio copy (phone, email, fees, about text). Edit here when the website changes.
src/lib/api/          Data layer: demo provider + Supabase provider behind one interface
src/constants/theme   Brand palette (ivory paper, charcoal, brass accent) and spacing
supabase/schema.sql   Database, storage buckets, and row-level security for the backend
docs/                 Setup, admin, and store-submission guides
```

## Run it

```bash
npm install
npm start            # then press i (iOS simulator), a (Android emulator), or scan the QR code with Expo Go
```

With no `.env` file the app runs in **demo mode** with sample sessions, a sample portfolio, and sample proof galleries. Sign in with any email and the code `123456`. Demo images are black-and-white placeholders from picsum.photos and must be replaced with real photographs before release.

To run against the real backend, copy `.env.example` to `.env` and fill in the Supabase URL and anon key. See `docs/SETUP.md`.

## Checks

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint (expo config)
npm run check        # both
```

## Ship it

Builds and store submissions run in the cloud through EAS, so no Mac or Android Studio is needed. The step-by-step guide, including the accounts and credentials required, is in `docs/STORE_SUBMISSION.md`.

```bash
npx eas-cli@latest build --profile preview      # installable test builds
npx eas-cli@latest build --profile production   # store builds
npx eas-cli@latest submit --profile production  # upload to App Store Connect / Google Play
```
