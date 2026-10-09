# Testing the app without store accounts

No Apple Developer or Google Play membership is needed to test. Those are only required to publish.

## One-time PC setup (about 15 minutes)

1. Install **Node.js** (LTS) from https://nodejs.org and **Git** from https://git-scm.com. Accept the defaults.
2. Open a terminal (PowerShell on Windows, Terminal on Mac) and run:

   ```
   git clone https://github.com/figgfig/DBP.git
   cd DBP
   git checkout claude/dubose-photography-app-pwsr60
   npm install
   ```

## One-time phone setup

3. Install the free **Expo Go** app from the App Store or Google Play.
4. Put the phone and the PC on the same Wi-Fi network.

## Each time you test

5. In the terminal, inside the `DBP` folder:

   ```
   npm start
   ```

6. Scan the QR code. iPhone: use the Camera app. Android: open Expo Go and tap **Scan QR code**.
7. The app loads on the phone. Sign in on **My Proofs** with any email and the code `123456` (demo mode). Code changes reload on the phone automatically.

If the QR code scans but nothing loads, the network is blocking phone-to-PC traffic. Press Ctrl+C and run `npx expo start --tunnel` instead.

## Other ways to test

| Method | Command | Needs |
| --- | --- | --- |
| Browser on the PC (layout check only) | `npm run web` | Nothing extra |
| Android emulator on the PC | `npm run android` | Free Android Studio with a virtual device |
| iPhone simulator | `npm run ios` | A Mac with Xcode (not possible on Windows) |
| Installable Android APK for any phone | `npx eas-cli@latest build --profile preview --platform android` | Free Expo account |

An installable iPhone build outside Expo Go is the one thing that requires the $99 Apple membership.

## Testing with real data

Demo mode uses sample sessions and placeholder images. To test with real sessions and proofs, follow `docs/SETUP.md` to create a free Supabase project and add the two values to a `.env` file, then restart `npm start`.
