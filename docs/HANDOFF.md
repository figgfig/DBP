# Handoff: where the DuBose Photography app stands

Read this first if you are picking up the project (person or Claude session). Also read `AGENTS.md` for Expo rules.

## Done

- Expo SDK 57 app (iOS + Android + web) with tabs Home, Calendar, Gallery, My Proofs, More. See `README.md`.
- Demo mode with sample data when no `.env` is set. Demo sign-in code: `123456`.
- Supabase backend schema with row-level security in `supabase/schema.sql` (not yet deployed to a real project).
- Ordering: each proof can be ordered in several sizes at once; clients can build **composites** from their proofs (`src/app/composite.tsx`, `src/lib/composites.ts`, `src/lib/cart.ts`).
- Docs: `docs/TESTING.md` (run on a phone), `docs/SETUP.md` (backend), `docs/ADMIN_GUIDE.md`, `docs/STORE_SUBMISSION.md`, `docs/COMPOSITES.md`, `docs/PRIVACY_POLICY.md`.
- Checks: `npm run check` (typecheck + lint) passes.

## Open items, in priority order

1. **Phone testing.** `npm run phone` starts a tunnel for Expo Go. Last report: Expo Go showed "Failed to download remote update". Next steps are in `docs/TESTING.md`; if it persists, try `npx expo start --lan --clear` on a Private Wi-Fi network.
2. **Real composite templates.** Replace the four starter layouts in `src/lib/composites.ts` with the studio's templates (format in `docs/COMPOSITES.md`).
3. **Real print sizes.** `PrintSizes` in `src/lib/content.ts` is a guess (`5x7, 8x10, 11x14, 16x20, 20x24`). Match it to the price sheet. Consider wallets.
4. **Real photos.** Hero, About portrait, and Gallery use grayscale placeholders from picsum.photos (`src/app/(tabs)/index.tsx`, `src/app/about.tsx`, `src/lib/api/demo.ts`). Swap in studio images and completed composites.
5. **Website copy check.** Studio text in `src/lib/content.ts` was taken from search-indexed pages of dubosephotography.com because the cloud session could not reach the site. Verify against the live site, including the calendar and hostess names. Two hostess emails are `hostess@example.com` placeholders.
6. **Backend.** Create a Supabase project and follow `docs/SETUP.md`.
7. **Store accounts.** Apple Developer ($99/yr) and Google Play ($25) are only needed to publish. See `docs/STORE_SUBMISSION.md`.
