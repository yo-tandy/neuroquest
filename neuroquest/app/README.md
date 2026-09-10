# NeuroQuest — mobile app

Flutter wrapper that ships the NeuroQuest web game (`assets/web/`, a copy of `../web/`) inside
a WebView for iOS and Android. The whole game runs on-device: no server, no network, no data
collection.

## Run

```bash
flutter pub get
flutter run            # any connected device or simulator
```

## Release

See [`../docs/RELEASE.md`](../docs/RELEASE.md) for the store checklist and
[`../docs/STORE_LISTING.md`](../docs/STORE_LISTING.md) for listing copy.

## Keeping the web copy in sync

`assets/web/` must stay identical to `../web/` (except `verify.mjs`). After editing the game:

```bash
cd .. && for f in index.html css/style.css css/fonts.css js/levels.js js/engine.js js/app.js; do cp web/$f app/assets/web/$f; done
diff -rq web app/assets/web
```
