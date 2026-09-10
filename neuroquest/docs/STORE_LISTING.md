# NeuroQuest — Store Listing Copy

Paste-ready text for App Store Connect and Google Play Console. Character limits are noted;
counts were checked against the text below.

## Identity

| Field | Value |
|---|---|
| App name | NeuroQuest |
| Bundle ID (iOS) | com.taveyo.neuroquest |
| Application ID (Android) | com.taveyo.neuroquest |
| Version | 1.0.0 (build 1) — from `pubspec.yaml` `version:` |
| Category | Education (secondary: Games › Puzzle / Educational) |
| Age rating | 4+ / Everyone — no violence, no purchases, no ads, no user content |
| Price | Free |
| Privacy policy URL | host `docs/PRIVACY.md` (see RELEASE.md) |

## Subtitle (iOS, ≤30 chars)

`Wire, tune and train a brain` (28)

## Short description (Google Play, ≤80 chars)

`Learn how neural networks think by wiring, tuning and training circuit boards.` (78)

## Promotional text (iOS, ≤170 chars)

`23 hand-verified puzzles take you from a single wire to training real neurons. No maths
lecture — every idea is something you build with your hands.` (149)

## Keywords (iOS, ≤100 chars, comma-separated)

`neural network,AI,machine learning,puzzle,circuit,learn,education,STEM,logic,brain,deep learning`
(99)

## Full description (both stores, ≤4000 chars)

**Ever wondered what is actually inside an AI? Build one.**

NeuroQuest turns a neural network into a printed circuit board you can touch. Sensors feed
signals in at the bottom, LEDs light up decisions at the top, and everything in between is
yours to wire, tune, and eventually train.

**Learn by building, not by reading**
Every concept arrives as a part on the board. You will route wires before you learn the word
"model," turn a volume knob before you learn the word "weight," and set a gate's bar before you
learn the word "bias." By the time the neuron chip appears, you have already built one by hand.

**Four sectors, 23 levels**
• SIGNALS — route evidence to the right verdict. Fix a board a previous engineer wired wrong.
• WEIGHTS — normalize raw readings, amplify whispers, invert evidence with a negative knob,
  and balance conflicting examples against each other.
• BIAS & ReLU — build AND and OR gates from the same chip, then discover why one gate can
  never detect a "middle" and two can.
• THE NEURON — fuse your hand-built parts into a chip that trains itself. Set the learning
  rate, watch the weight LEDs move, and feel what "too hot" does to training.

**Every level is real**
Nothing is animated for show. The meters, the confidence percentages, the epoch counter, and
the loss curve all come from the same live engine that would run a real network. Every level's
star bars are machine-verified achievable, and no level can be passed without the idea it
teaches.

**Stars reward understanding**
One star for a board that works. Two and three for a board that is *sure* — or for training
that finishes under par. Replay any level to improve.

**Free Lab**
A sandbox with dials, amplifiers, gates, and junctions. Wire anything to anything and watch
the meters respond live.

**Made for curious people of any age**
No prior maths. No accounts, no ads, no internet connection needed. Your progress stays on
your device.

Wire it. Tune it. Train it.

(2,010 chars)

## What's new (v1.0.0)

`First release: 4 sectors, 23 levels, Free Lab sandbox.`

## Screenshots to capture

Take these on a 6.7" iPhone (1290×2796) and a 6.5"/6.7" Android phone; App Store Connect
also needs 6.5" (1284×2778) or will scale, and Google Play accepts 16:9 to 9:16 between 320 and
3840 px. Suggested shots, in order:

1. Sector map (Sector 01 open, a few pads starred).
2. S1L3 Tortoise & Hare mid-wire — the ghost wire being dragged to FAST.
3. S2L2 Volume Knob — knob being turned, both meters lit.
4. S3L4 The AND Gate — two amps merged into the gate, ★★★ win card.
5. S4L1 It Learns! — training console with the loss curve and the b LED red.
6. Free Lab with a few parts placed.

Feature graphic (Google Play, 1024×500): `app/assets/branding/feature_graphic.png`.
App icon source (1024×1024): `app/assets/branding/icon.png`.

## Data safety / App privacy answers

- Data collected: **none**. Data shared: **none**.
- Google Play Data safety: "Does your app collect or share any of the required user data
  types?" → **No**. Encryption in transit: N/A (no network). Deletion request: N/A.
- App Store "App Privacy": **Data Not Collected**.
- Google Play "Ads": No. "Target audience": all ages is fine, but if you choose to include
  under-13 the Families policy applies — the app already meets it (no ads, no data, no links out).
- Export compliance: `ITSAppUsesNonExemptEncryption = false` is set in Info.plist (the app
  uses no encryption beyond the OS).
