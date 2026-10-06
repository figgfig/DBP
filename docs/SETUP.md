# Backend setup (Supabase)

The app stores sessions, bookings, hostess applications, client galleries, proofs, favorites, and orders in a Supabase project (Postgres + Storage + Auth). Supabase's free tier is enough to start.

## 1. Create the project

1. Sign in at https://supabase.com and create a new project (pick the US East region for Charleston).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates every table, the `request_booking` function, the `portfolio` (public) and `proofs` (private) storage buckets, and the row-level security policies.
3. Optionally run `supabase/seed.sql` for a few sample sessions.

## 2. Turn on email one-time codes

1. **Authentication → Providers → Email**: keep Email enabled, turn **Confirm email** off, and turn on **Enable email OTP** (one-time passcode).
2. **Authentication → Email Templates → Magic Link**: make sure the body includes `{{ .Token }}` so the client receives a 6-digit code. Suggested text:

   > Your DuBose Photography sign-in code is {{ .Token }}. It expires in one hour.

3. Default Supabase email is rate-limited to a handful of messages per hour. Before launch, connect a custom SMTP provider under **Project Settings → Auth → SMTP** (Resend, Postmark, or Gmail SMTP all work) so clients receive codes reliably.

## 3. Make DuBose a staff user

Staff users can see every booking, application, order, and gallery. Clients only see their own.

1. Sign in to the app once with the studio email (ordersdbp@gmail.com) so an auth user exists, or create one under **Authentication → Users**.
2. In the SQL editor:

   ```sql
   insert into staff (user_id)
   select id from auth.users where email = 'ordersdbp@gmail.com';
   ```

## 4. Point the app at the project

1. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
2. Copy `.env.example` to `.env` and fill both values:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. Restart `npm start`. The "Demo data" note disappears from the bottom of the More tab.

For EAS cloud builds, add the same two values as EAS environment variables (`npx eas-cli@latest env:create`) or in the Expo dashboard under the project's **Environment variables** so they are baked into store builds.

The anon key is safe to ship in the app: row-level security in `schema.sql` is what protects client data.

## 5. Data the studio maintains

See `docs/ADMIN_GUIDE.md` for how to add sessions, upload proofs, and read bookings and applications from the Supabase dashboard.
