# NeuroQuest — Release Checklist

The Flutter wrapper in `app/` ships the web game from `app/assets/web/` inside a WebView.
Everything below has been prepared in the repo; the steps marked **YOU** need your accounts,
passwords, or a decision, and cannot be done from the code.

## What is already in place

| Area | Status |
|---|---|
| App name | "NeuroQuest" on both platforms |
| Identifiers | `com.taveyo.neuroquest` (iOS bundle ID and Android application ID) |
| Icons | Generated from `app/assets/branding/icon.png` via `flutter_launcher_icons` (iOS set, Android adaptive + monochrome) |
| Launch screen | Dark board green with the chip motif on both platforms, incl. Android 12+ splash API; the native splash stays up until the WebView has painted |
| Offline | Fonts are bundled (`assets/web/fonts`, SIL OFL); the app makes no network requests and declares no INTERNET permission |
| Orientation | Portrait only |
| iOS devices | iPhone only for v1 (see below) |
| iOS privacy | `PrivacyInfo.xcprivacy` declares no tracking, no collected data; `ITSAppUsesNonExemptEncryption = false`; category Education |
| Android release | R8 minify + resource shrinking on; signing reads `android/key.properties`; if it is missing, every release build (`flutter build appbundle/apk --release`, `flutter run --release`) fails with a pointer to this doc instead of producing a debug-signed artifact. Debug builds need no key |
| Back button | Android back steps out of a level / modal before it exits the app |
| Docs | `docs/STORE_LISTING.md` (copy, keywords, screenshot list), `docs/PRIVACY.md` |

## iOS: iPhone only (v1)

v1 targets iPhone only (`TARGETED_DEVICE_FAMILY = 1` in `ios/Runner.xcodeproj/project.pbxproj`).
The game is a portrait phone layout (`#app` is capped at 430px wide), so a native iPad build
would need 13" iPad screenshots and would be reviewed as a letterboxed phone UI. iPads can still
install it from the App Store and run it in iPhone compatibility mode.

To add native iPad support later: set `TARGETED_DEVICE_FAMILY = "1,2"` in all three build
configurations (Debug/Release/Profile), add `UISupportedInterfaceOrientations~ipad` and
`UIRequiresFullScreen` back to `ios/Runner/Info.plist`, check the layout on iPad sizes, and
add 13" iPad screenshots in App Store Connect.

## Versioning

Bump `version:` in `app/pubspec.yaml` before every upload. `1.0.0+1` → build name 1.0.0,
build number 1. Both stores reject a build number they have already seen, so increment the
`+N` every time.

## Google Play

1. **YOU — create the upload keystore** (once; back it up, losing it means a new app listing):
   ```bash
   keytool -genkey -v -keystore ~/neuroquest-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. **YOU — write `app/android/key.properties`** (git-ignored):
   ```
   storePassword=<password>
   keyPassword=<password>
   keyAlias=upload
   storeFile=/Users/<you>/neuroquest-upload.jks
   ```
   Without this file the Gradle task `checkReleaseSigningKey` fails any release build with
   "Release signing key not configured" — there is no silent fallback to the debug key, since a
   debug-signed `.aab` is rejected by Play Console and a debug-signed APK can never be updated.
3. **YOU — once per machine:** install the Android SDK "command-line tools" component
   (Android Studio → SDK Manager → SDK Tools → *Android SDK Command-line Tools*, then
   `flutter doctor --android-licenses`). Without it `flutter build appbundle` still writes a
   correct, symbol-stripped `.aab`, but the Flutter tool cannot run `apkanalyzer` to confirm the
   stripping and exits with "failed to strip debug symbols" (this is the state of the build
   machine used to prepare this release; the bundle itself was verified to contain
   `BUNDLE-METADATA/…/libflutter.so.sym`).
4. Build the bundle:
   ```bash
   cd app && flutter build appbundle --release
   ```
   Output: `app/build/app/outputs/bundle/release/app-release.aab` (≈39 MB, three ABIs).
5. **YOU — Play Console**: create the app (Education, free), upload the `.aab` to Internal
   testing first, then Production. Fill in: store listing (copy from `docs/STORE_LISTING.md`,
   feature graphic from `app/assets/branding/feature_graphic.png`, 2–8 phone screenshots),
   Data safety ("no data collected"), content rating questionnaire (Everyone), privacy policy
   URL, target audience.
6. Google Play requires **Play App Signing**; accept it on first upload (your `.jks` is the
   upload key, Google holds the app signing key).

## Apple App Store

1. **YOU — Apple Developer account** and an App Store Connect record: name "NeuroQuest",
   bundle ID `com.taveyo.neuroquest`, SKU e.g. `neuroquest-ios`. The Xcode project already has
   team `6QN7NR33F8` with automatic signing.
2. Build and archive:
   ```bash
   cd app && flutter build ipa --release
   ```
   Output: `app/build/ios/ipa/NeuroQuest.ipa` (and the `.xcarchive`). If signing fails, open
   `ios/Runner.xcworkspace` in Xcode once, select your team under Signing & Capabilities, and
   re-run.
3. Upload with Transporter, or:
   ```bash
   xcrun altool --upload-app --type ios -f build/ios/ipa/*.ipa --apiKey <key> --apiIssuer <issuer>
   ```
4. **YOU — App Store Connect**: TestFlight first, then the App Store form. Fill in: subtitle,
   promotional text, description, keywords (all in `docs/STORE_LISTING.md`), 6.7" and 6.5"
   screenshots, App Privacy → "Data Not Collected", age rating 4+, category Education, privacy
   policy URL, support URL (the GitHub repo is acceptable).

## Privacy policy URL

Both stores need a public URL. The simplest option with this repo: enable GitHub Pages
(Settings → Pages → Deploy from branch `main`, folder `/`), then the policy renders at
`https://yo-tandy.github.io/neuroquest/neuroquest/docs/PRIVACY`. Before that, **fill in the
contact email** at the bottom of `docs/PRIVACY.md`.

## Pre-flight, every release

```bash
cd app
flutter pub get
flutter analyze
flutter test
flutter build appbundle --release
flutter build ipa --release
```

Also run the level verifier after any content change and keep the two web copies identical:

```bash
node web/verify.mjs
diff -rq web app/assets/web   # only verify.mjs may differ
```

## Regenerating branding

`app/assets/branding/*.png` are produced by a small Pillow script (see git history). After
changing `icon.png`, `icon_foreground.png`, or `splash.png`:

```bash
cd app
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```
