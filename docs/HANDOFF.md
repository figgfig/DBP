# Handoff: where the DuBose Photography app stands

Read this first if you are picking up the project (person or Claude session). Also read `AGENTS.md` for Expo rules.

## Business rules

- **Prices stay hidden until a client is ordering from their own gallery.** See `AGENTS.md` → Business rules.
- **Two kinds of sessions work on this repo: Claude on the studio PC and Claude in the cloud.** They do not share memory. Start every session with `git pull`, commit and push before stopping, and record what changed in the dated section below. On 2026-10-16 the PC's uncommitted work and the cloud's commits had to be merged by hand.

## Done

- Expo SDK 57 app (iOS + Android + web) with tabs Home, Calendar, Gallery, My Proofs, More. See `README.md`.
- Demo mode with sample data when no `.env` is set. Demo sign-in code: `123456`.
- Supabase backend schema with row-level security in `supabase/schema.sql` (not yet deployed to a real project).
- Ordering: each proof can be ordered in several sizes and packages at once; clients can build **composites** from their proofs (`src/app/composite.tsx`, `src/lib/composites.ts`, `src/lib/cart.ts`).
- Docs: `docs/TESTING.md` (run on a phone), `docs/SETUP.md` (backend), `docs/ADMIN_GUIDE.md`, `docs/STORE_SUBMISSION.md`, `docs/COMPOSITES.md`, `docs/PRIVACY_POLICY.md`.
- Composite layouts are the studio's twelve real ones, measured from `F:\Dub Templates` (see `docs/COMPOSITES.md`).
- Print sizes match the price list: 4 wallets, 4x5, 5x7, 8x10, 11x14, 16x20.
- Calendar uses the real sessions from the website (Atlanta Oct 1 and 2, Charlotte Oct 19 and 20, Charlotte / Lake Norman Oct 21, 2026), in both demo mode and `supabase/seed.sql`.
- Decided by the user on 2026-10-09: keep the app's own booking flow (not SignUpGenius). Payment copy says Venmo (@dubphotos), plus cash for sitting fees, and does not mention PayPal or checks.
- Checks: `npm run check` (typecheck + lint) passes.

## 2026-10-16: PC and cloud work merged

- The cloud session's two commits from 2026-10-15 (prices hidden outside the order flow; About page about the studio) are merged with the PC's 2026-10-09 work (real layouts, sizes, prices, calendar, photos).
- **Prices now live in the gallery's price list**, never in `src/lib/content.ts`. `PriceList` (`src/lib/types.ts`) gained `packages`, `singles` (tiered single-image table), `compositeExtraChild` and `notes`, with matching columns on `price_lists`. The studio's real Spring 2026 list is the demo galleries' price list (`src/lib/api/demo.ts`) and is inserted by `supabase/seed.sql`.
- The order screen shows packages, composite prices (second print of the same composite half price, $75 per extra child), and the single-image price table. Single prints are tiered, so they count as "priced by the studio" in the estimated total.
- How Sessions Work (`src/app/pricing.tsx`) no longer lists prices, and sitting fee copy no longer names an amount.
- The About page uses the cloud's studio layout. The year is **1994**, as on the live About page (the site's hidden meta description still says 1977). The photographer portrait is no longer shown.

## Open items, in priority order

1. **Phone testing.** `npm run phone` starts a tunnel for Expo Go. Last report: Expo Go showed "Failed to download remote update". Next steps are in `docs/TESTING.md`; if it persists, try `npx expo start --lan --clear` on a Private Wi-Fi network.
2. **Permission for the real photos.** Since 2026-10-09 the Home hero, Gallery tab, About page images and demo proofs use the studio's own finished prints and composites, rendered from the weekly folders on the Bran Data drive (see `assets/studio/README.md`, `src/lib/studio-photos.ts`). They are client children, so the files are git-ignored (the repo is public) and a fresh clone (including a cloud session) shows grayscale placeholders. Before a store release or a public web build, the studio needs the families' permission, or should pick images it already publishes on dubosephotography.com.
3. **Confirm prices.** The order forms vary a little: a few 16x20 composites at $725 instead of $795, and three 8x10 04 Horizontal composites at $265. The 2021 price list's "first photo of a different child" row does not appear in 2026 orders, where each child's first print was charged full price. Note the repo is public, so the price list in `demo.ts` and `seed.sql` is readable by anyone on GitHub.
4. **Still unconfirmed copy.** Ages 6 months to 16 years are not on the website. The representative's email on the site is sophiefulmerdubose@gmail.com; the app shows only her phone.
5. **Hostess emails.** The website does not list hostess emails for the current sessions, so the app shows names only.
6. **Keep the calendar current.** New sessions on the website need adding to Supabase, or to `src/lib/api/demo.ts` while in demo mode. The website calendar can be read as JSON at `https://www.dubosephotography.com/calendar?format=json`.
7. **Backend.** Create a Supabase project and follow `docs/SETUP.md`.
8. **Store accounts.** Apple Developer ($99/yr) and Google Play ($25) are only needed to publish. See `docs/STORE_SUBMISSION.md`.
