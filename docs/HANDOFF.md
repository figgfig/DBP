# Handoff: where the DuBose Photography app stands

Read this first if you are picking up the project (person or Claude session). Also read `AGENTS.md` for Expo rules.

## Done

- Expo SDK 57 app (iOS + Android + web) with tabs Home, Calendar, Gallery, My Proofs, More. See `README.md`.
- Demo mode with sample data when no `.env` is set. Demo sign-in code: `123456`.
- Supabase backend schema with row-level security in `supabase/schema.sql` (not yet deployed to a real project).
- Ordering: each proof can be ordered in several sizes at once; clients can build **composites** from their proofs (`src/app/composite.tsx`, `src/lib/composites.ts`, `src/lib/cart.ts`).
- Docs: `docs/TESTING.md` (run on a phone), `docs/SETUP.md` (backend), `docs/ADMIN_GUIDE.md`, `docs/STORE_SUBMISSION.md`, `docs/COMPOSITES.md`, `docs/PRIVACY_POLICY.md`.
- Composite layouts are the studio's twelve real ones, measured from `F:\Dub Templates` (see `docs/COMPOSITES.md`).
- Print sizes match the price list: 4 wallets, 4x5, 5x7, 8x10, 11x14, 16x20.
- Print prices (packages, composites, single images) come from the studio's Spring 2026 order forms and are in `src/lib/content.ts`. They show on the Sessions & Pricing screen, as package rows on each proof in the order screen, and on composite size choices.
- Calendar uses the real sessions from the website (Atlanta Oct 1 and 2, Charlotte Oct 19 and 20, Charlotte / Lake Norman Oct 21, 2026), in both demo mode and `supabase/seed.sql`.
- Decided by the user on 2026-10-09: keep the app's own booking flow (not SignUpGenius). Payment copy says Venmo (@dubphotos), plus cash for sitting fees, and no longer mentions PayPal either way.
- Checks: `npm run check` (typecheck + lint) passes.

## Open items, in priority order

1. **Phone testing.** `npm run phone` starts a tunnel for Expo Go. Last report: Expo Go showed "Failed to download remote update". Next steps are in `docs/TESTING.md`; if it persists, try `npx expo start --lan --clear` on a Private Wi-Fi network.
2. **Permission for the real photos.** Since 2026-10-09 the Home hero, About portrait, Gallery tab and demo proofs use the studio's own finished prints and composites, rendered from the weekly folders on the Bran Data drive (see `assets/studio/README.md`, `src/lib/studio-photos.ts`). They are client children, so the files are git-ignored (the repo is public) and a fresh clone shows grayscale placeholders. Before a store release or a public web build, the studio needs the families' permission, or should pick images it already publishes on dubosephotography.com.
3. **Confirm prices.** The order forms vary a little: a few 16x20 composites at $725 instead of $795, and three 8x10 04 Horizontal composites at $265. The 2021 price list's "first photo of a different child" row does not appear in 2026 orders, where each child's first print was charged full price.
4. **Studio address.** Updated on 2026-10-09 to 6201 Church Flats Road, Hollywood, SC 29449, as on the 2026 order forms.
5. **Still unconfirmed copy.** The photographer's full name and ages 6 months to 16 years are not on the website. The representative's email on the site is sophiefulmerdubose@gmail.com; the app shows only her phone.
6. **Hostess emails.** The website does not list hostess emails for the current sessions, so the app shows names only.
7. **Keep the calendar current.** New sessions on the website need adding to Supabase, or to `src/lib/api/demo.ts` while in demo mode. The website calendar can be read as JSON at `https://www.dubosephotography.com/calendar?format=json`.
8. **Backend.** Create a Supabase project and follow `docs/SETUP.md`.
9. **Store accounts.** Apple Developer ($99/yr) and Google Play ($25) are only needed to publish. See `docs/STORE_SUBMISSION.md`.
