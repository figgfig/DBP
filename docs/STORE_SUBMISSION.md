# Publishing to the App Store and Google Play

Builds run on Expo's EAS cloud service, so this can all be done from any computer. Budget a few hours for account setup and 1 to 3 business days for the first app reviews.

## Accounts and access needed

| Item | Who provides it | Cost |
| --- | --- | --- |
| **Apple Developer Program** membership for DuBose Photography (or DuBose Blakeney as an individual) | DuBose, at https://developer.apple.com/programs/enroll | $99 / year |
| **Google Play Console** developer account | DuBose, at https://play.google.com/console/signup | $25 one time |
| **Expo account** (free) and an EAS project | Whoever runs the builds, at https://expo.dev | Free tier covers a small number of builds per month |
| **Supabase project** credentials | From `docs/SETUP.md` | Free tier |
| **Privacy policy URL** on dubosephotography.com | Publish `docs/PRIVACY_POLICY.md` as a page on the website | — |
| App Store listing assets | Icon is generated from `assets/images/icon.png`; need 6.7" and 6.5" iPhone screenshots, 12.9" iPad screenshots, feature graphic 1024×500 for Google Play, short and long descriptions | — |

Both stores require a 2-factor-enabled account owned by the business. Apple also requires a D-U-N-S number for an organization account; an individual account in DuBose's name avoids that.

## One-time project setup

```bash
npm install -g eas-cli            # or use npx eas-cli@latest everywhere
eas login
eas init                          # creates the EAS project and writes its id into app.json (replaces REPLACE_WITH_EAS_PROJECT_ID)
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://xxxx.supabase.co --environment production
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJ... --environment production
```

Fill in `eas.json → submit.production`:
- `appleId`: the Apple ID email of the developer account
- `appleTeamId`: from https://developer.apple.com/account (Membership details)
- `ascAppId`: the numeric Apple ID of the app record, created in App Store Connect → My Apps → + → New App (bundle id `com.dubosephotography.app`)
- `serviceAccountKeyPath`: a Google Cloud service-account JSON with "Release manager" access in Play Console → Users and permissions. Keep this file out of git (it is already ignored).

## Test builds

```bash
eas build --profile preview --platform all
```

Produces an installable Android APK and an iOS ad-hoc build (register test iPhones with `eas device:create` first). Share the links with DuBose and a couple of hostesses to try the booking flow, sign-in, and proofs with real data before release.

## Store builds and submission

```bash
eas build --profile production --platform all
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

EAS manages signing certificates and keystores for you. The first iOS submit lands in **TestFlight**; the first Android submit lands on the **Internal testing** track (see `track` in `eas.json`). Promote each to production from the store consoles once the listing is complete.

## Store listing checklist

- **Name**: DuBose Photography
- **Subtitle / short description**: Classic black & white portraits of children
- **Category**: Photo & Video
- **Age rating**: 4+ / Everyone (no user-generated content, no ads)
- **Privacy**: App Store "App Privacy" questionnaire. The app collects name, email, phone, and photos tied to the user, used for app functionality only, no tracking. Google Play Data safety form: same answers.
- **Sign-in review note**: give Apple and Google reviewers a test email that has a gallery attached, and explain that a 6-digit code is emailed (Apple reviewers accept this; alternatively create a gallery for a reviewer email and give them a Supabase user with a known code via a custom SMTP log).
- **Support URL**: https://www.dubosephotography.com/contact
- **Marketing URL**: https://www.dubosephotography.com

## Updates after launch

Text, layout, and logic changes ship over the air without a store review:

```bash
eas update --channel production --message "Fall 2027 dates"
```

Changes that add native modules or bump the Expo SDK need a new store build (`eas build` + `eas submit`). Bump `version` in `app.json` for those; build numbers auto-increment.
