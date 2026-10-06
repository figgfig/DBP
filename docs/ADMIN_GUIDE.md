# Studio admin guide

Everything the app shows comes from the Supabase project. Until an admin screen is built, the Supabase dashboard (**Table Editor** and **Storage**) is the admin tool. Each section below is one task DuBose or a representative will do regularly.

## Post a travel session

1. **Table Editor → photo_sessions → Insert row**
   - `city`, `state` (two letters), `start_date`, `end_date` (same as start for a one-day session)
   - `sitting_fee` and `minimum_order` (defaults are $100 / $200; Mount Pleasant home sessions use $75 / $75)
   - `status`: `open`, `waitlist`, `full`, or `past`
   - `venue_name`, `address`, `notes` are optional and shown on the session page
   - `published`: tick to make it visible in the app
2. **session_hostesses → Insert row** for each hostess: `session_id`, `name`, `email`, `phone`.
3. **time_slots**: add one row per 15-minute time, or generate a day in the SQL editor:

   ```sql
   insert into time_slots (session_id, starts_at)
   select '<session id>', (date '2027-03-12' + time '09:00') + (n * interval '15 minutes')
   from generate_series(0, 19) as n;   -- 9:00 through 1:45
   ```

When a family requests a time, the slot is marked `available = false` automatically and a row appears in **bookings** with status `requested`. Email or call the family to confirm, then set the status to `confirmed`. If they cancel, set the booking to `cancelled` and tick `available` on the slot again.

## Read hostess applications

**Table Editor → hostess_applications**. Each row has the applicant's name, contact details, city, preferred season, venue idea, and message. Follow up by phone or email; there is nothing else to do in the dashboard.

## Deliver proofs to a family

1. **Storage → proofs → Create folder**, named with the gallery's id (create the gallery first, step 2, then copy its `id`). Upload two files per proof: a thumbnail around 400 px wide and the full-size proof. Keep the proof number in the file name (for example `DBP-0142-thumb.jpg` and `DBP-0142.jpg`). Optionally upload the price sheet PDF and a cover image to the same folder.
2. **Table Editor → galleries → Insert row**
   - `title` (for example "Spring 2027 — Augusta")
   - `session_date`
   - `client_email`: the email the family gave at the session. This is what links the gallery to their sign-in.
   - `cover_path`, `price_sheet_path`: paths inside the bucket, like `<gallery id>/cover.jpg`
   - `order_by`: optional ordering deadline shown in the app
3. **proofs → Insert row** per image: `gallery_id`, `label` (DBP-0142), `thumbnail_path`, `full_path`, `sort_order`.

The family opens the app, signs in with that email, and the gallery appears under **My Proofs**. The `proofs` bucket is private; the app issues one-hour signed links and storage policies only let a client read files in their own gallery folder.

Bulk uploads: the Supabase CLI (`supabase storage cp -r ./proofs/<gallery id> ss:///proofs/<gallery id>`) uploads a whole folder at once, and a short SQL `insert ... select` can create the proof rows from the file list.

## Read favorites and orders

- **favorites** lists which proofs each client hearted (`user_id` joins to Authentication → Users for the email).
- **proof_orders** holds submitted orders. `items` is a list of `{ label, size, quantity }`. Set `status` to `invoiced`, `printed`, or `delivered` as you work through them.

## Update the portfolio

Upload images to **Storage → portfolio** (public bucket), then add a row in **portfolio_images** with `storage_path`, optional `caption`, `category` (`single`, `composite`, `siblings`), and `sort_order`.

## Change studio copy

Phone, email, address, the About text, sitting-fee wording, and the state representative's details live in `src/lib/content.ts` in the app. Edits there ship with the next app update (or instantly with an EAS over-the-air update, see `docs/STORE_SUBMISSION.md`).
