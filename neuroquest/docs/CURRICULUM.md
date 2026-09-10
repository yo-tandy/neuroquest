# NeuroQuest — Curriculum Document

**Scope:** all shipped content — 4 sectors, 23 levels (plus the Free Lab sandbox).
**Audience:** internal — level/curriculum design. Learning goals below are *not* shown to players.
**Verification status:** every level's ★★★ threshold / epoch par is machine-verified achievable
(`web/verify.mjs`), no level is solvable by its initial state, and no level with knobs is
solvable by correct wiring alone — untouched dials always fail at least one card. Three
further "the lesson is unskippable" rules are enforced: (a) a *shortcut circuit* that leaves
out the level's new part (S3L1 without Σ, S3L4 without amps) caps below ★★; (b) with the
level's *lesson knob* pinned at its factory value (S3L2/S3L4 bias, S2L6 second amp) the other
knobs cap below ★★; (c) on train levels with an unlocked throttle, the *factory learning
rate* never reaches ★★★ — the throttle has to be moved (12 seeds per rate).

**Difficulty scale used below:** 1 = trivial · 2 = easy · 3 = moderate · 4 = hard · 5 = boss-hard.

---

## How the game teaches (framing)

The game presents a neural network as a **printed circuit board**: input pins (sensors) at the
bottom, output meters (decisions) at the top, and parts in between. Signals flow upward. The
metaphor mapping the whole curriculum is built on:

| Game object | ML concept |
|---|---|
| Input pin + "sig" readout | Feature (normalized value) |
| NORMALIZER (0 @ / ±1 @) | Feature normalization / scaling |
| AMP (rotary ×w knob) | Weight (multiplication) |
| Σ junction | Weighted-sum aggregation |
| GATE (bias knob + clip) | Bias + ReLU activation |
| NEURON chip (w-LEDs, b) | Artificial neuron (w·x + b, ReLU) |
| Output meters + % | Softmax scores / class confidence |
| Cards (with answers shown) | Labeled training examples |
| ⚡ TRAIN / throttle | Gradient descent / learning rate |
| Stars via "weakest card confidence" | Decision margin / certainty |
| Stars via epoch pars | Training efficiency |

---

# Sector 01 · SIGNALS — “electricity in, decisions out”

**Theme:** animal speed. Two physical sensors carry the sector: **SPEED** (km/h, higher =
faster) and **PACE** (seconds per meter, higher = slower) — the same quantity measured in
opposite directions, a setup that Sector 02's opening normalization lesson cashes in. All
numbers stay in everyday, believable ranges (a hare really does ~70 km/h; an elephant really
does ~40).

### Sector learning goals
1. **Dataflow model:** evidence enters at input pins, flows along wires, and the *strongest
   output wins* the decision (implicit argmax).
2. **Routing = knowledge:** which evidence supports which conclusion is itself the model.
3. **Repair as diagnosis:** a model can be wrong in *structure*; debugging = delete + rebuild.
4. **Labeled examples:** cards carry both features and the expected answer; a circuit is correct
   when *every* card lands on its expected output.

The sector is now purely about **wiring** — signals are routed, never changed. Changing signals
(normalization, then weights) is exactly where Sector 02 picks up.

### Coverage assessment
All four goals are covered thoroughly and gently: one wire → repairing a wrong wire → two
opposing sensors → three-way routing. The boss (The Great Race) genuinely tests the routing
concept including mixed-evidence cards (Pig, Chicken, Tortoise). With normalization moved out,
the sector has a single clean arc and no knob appears anywhere in it — the first dial the
player ever touches is S2L1's.

### Gap analysis (concepts used but not yet taught)
- **The % meters (softmax) are explained in words only.** The SIG-00 datasheet now says the
  meters *split 100% between the LEDs* — equal scores read 50/50, and the further one score
  pulls ahead the surer the board is, "and that certainty is what earns stars"; the Great Race
  briefing adds that with three LEDs the split is three-way, so 50% is a confident call there.
  This gives the player a working model for the confidence-based star rule (≥73% for ★★★),
  but the mechanism is still narrated, not played. *Remaining recommendation:* a half-level
  showing two raw scores becoming percentages.
- **Raw-unit readouts appear before normalization is taught.** S1's pins show km/h and s/m
  values (and the boss shows likeness %) while the "sig" concept is still hidden; harmless, but
  the first S2 briefing has to carry the whole "raw numbers lie" reveal on its own.

---

### S1L1 · First Sprint
- **Player description:** "Wire the speed pin to FAST so the board lights the right LED for the
  🐇 Hare."
- **Hidden learning goal:** the core interaction loop — drag one wire, watch the signal pulse,
  see a card verdict. Establish that *doing nothing = SLOW wins by default* (empty output = 0).
- **Setup:** free wiring, no components. Sig readouts hidden (normalization not yet introduced).
- **Inputs/outputs:** SPEED (km/h) → SLOW / FAST. 1 card: Hare[70 km/h]→FAST.
- **Difficulty:** 1.
- **Differs from previous:** n/a (first level).
- **Learning advance:** high per minute spent. Teaches the entire interface (cards, wires,
  meters, submit) with a single degree of freedom. ★★★ (≥0.73) is earned by the only correct
  action, so success feels immediate. Sound foundation.

### S1L2 · Wrong Way
- **Player description:** "A previous engineer wired SPEED into SLOW — no wonder the 🐘 Elephant
  fails: it actually charges at 40 km/h! Tap the bad wire to remove it, then route it right."
- **Hidden learning goal:** models can be *wrong in structure*, not just in degree; debugging =
  delete + rebuild. Teaches wire-deletion mechanics on the smallest possible board, one level
  after wire-creation was learned.
- **Setup:** free wiring but pre-wired incorrectly (SPEED→SLOW); single input, single card.
- **I/O:** SPEED (km/h) → SLOW / FAST. Card: Elephant[40 km/h]→FAST.
- **Difficulty:** 1.
- **Differs from previous:** starts from a *broken* state; first delete action. The elephant is
  a deliberate expectation-breaker (big ≠ slow) — the card label, not intuition, is the truth.
- **Learning advance:** "diagnose by testing cards, then repair" is a real ML workflow in
  miniature, now learned before any multi-input complexity. (This replaces the old late-sector
  Crossed Wires level; moving repair to L2 lets every later level assume the full wire toolkit.)

### S1L3 · Tortoise & Hare
- **Player description:** "Two sensors, two LEDs. SPEED (km/h) grows when an animal is fast —
  PACE (seconds per meter) grows when it is slow. Route each kind of evidence to the LED it
  supports."
- **Hidden learning goal:** *feature–class association*: different features are evidence for
  different classes; a model is a set of such associations. Also first two-card consistency
  requirement (one circuit must satisfy all cards), and first exposure to the idea that two
  sensors can measure the *same quantity in opposite directions* — the seed of S2L1's normalization lesson.
- **Setup:** free wiring, no components, sig hidden.
- **I/O:** SPEED, PACE → SLOW / FAST. Cards: Hare[70 km/h, 0.1 s/m]→FAST;
  Tortoise[0.3 km/h, 12 s/m]→SLOW — the two ends of the spectrum, per the fable.
- **Difficulty:** 1–2.
- **Differs from previous:** two inputs, two cards; the first time a wrong-but-plausible wiring
  (both pins → one LED) fails a card.
- **Learning advance:** solid. The "one circuit, many cards" constraint is the quiet backbone of
  everything later (it *is* fitting a dataset), and it lands here without friction.

### S1L4 · The Great Race — BOSS
- **Player description:** "Three detectors, three verdicts: quick as a fox, walks like a duck,
  crawls like a snail. Route all three so every animal gets the right call. With three LEDs the
  meters split three ways — here 50% is a confident call."
- **Hidden learning goal:** multi-class classification is just more routes; features can be
  *similarities* (0…1 likeness scores) rather than physical readings — the first abstract
  feature space; one input can carry a little irrelevant co-activation (Tortoise is 0.2
  duck-like) and the decision still holds — first taste of *margin* mattering.
- **Setup:** free wiring, no components, 3×3. Sig readouts still hidden (normalization is not
  yet taught); pins display raw likeness %.
- **I/O:** FOX-LIKE, DUCK-LIKE, SNAIL-LIKE → FAST / MODERATE / SLOW. 7 cards (2/3/2), and every
  card's likenesses **sum to 100%** — the features read as shares, not independent scores:
  Hare[100, 0, 0]→FAST; Fox[100, 0, 0]→FAST (the namesake — two different animals, same
  signature: features describe *behavior*, not identity); Duck[0, 100, 0]→MODERATE;
  Chicken[10, 90, 0]→MODERATE; Pig[20, 80, 0]→MODERATE; Snail[0, 0, 100]→SLOW;
  Tortoise[0, 20, 80]→SLOW. The three MODERATE cards carry a within-class speed ordering in
  their fox-share (pig 20 > chicken 10 > duck 0) — same verdict, different margins, quietly
  seeding the idea that a class is a *region*, not a point.
- **Difficulty:** 2 (boss by scope, not by trickiness).
- **Differs from previous:** first 3-output board; first card with distractor evidence; features
  are likenesses, not measurements — quietly previewing "features are whatever the sensors say."
- **Learning advance:** consolidation rather than new concept — the right job for a first boss.
  The Tortoise card also pays off L3's fable pairing. The ★★★ threshold (0.50) is low because
  3-way softmax caps confidence; this is invisible to players and is exactly the kind of thing
  the missing softmax explainer would clarify.

---

# Sector 02 · WEIGHTS — “every wire has a volume knob”

**Framing:** Sector 01 was wiring only — this sector's thesis is that **parts change signals**.
It opens with the normalizer (fix a scale so raw readings become comparable) and then spends
the rest of the sector on the amplifier (scale evidence by a tunable weight). One sector, one
idea — "signals can be reshaped" — with two instruments.

### Sector learning goals
1. **Normalization (S2L1):** raw sensor readings are incomparable across units — the *scale*
   decides the verdict, not the animal; mapping onto a common signal range fixes it. Also the
   player's first knob.
2. **Weight as multiplication:** an amplifier scales evidence; strength of belief is tunable.
3. **Confidence vs correctness:** the same (correct) circuit becomes *more certain* with larger
   weights — stars now reward margin, not routing.
4. **Weak evidence can be amplified** (small signal × big weight).
5. **Negative signals** interact with weights meaningfully (sign carries meaning).
6. **Negative weights invert evidence** — a wire's *sign* is part of the model; when the
   structure is wrong and cannot be rewired, the weight can argue the other way.
7. **Balancing multiple weights** against *conflicting* cards (the essence of fitting).
8. **Constant input (PWR rail) as a threshold** — the bias idea, smuggled in early.
9. **Σ junction (boss):** evidence must be *merged* to be summed — new part, gateway to Sector 03.

### Coverage assessment
The strongest sector. Each level adds exactly one idea and the boss composes all of them
(routing + amplification + rail threshold + merging). The normalizer opening earns the sector's
thesis mechanically (S2L1 is provably unsolvable without touching a dial), and weights then
generalize it: the normalizer *fixes* a scale once, the amp makes scaling *the player's ongoing
instrument*. Confidence-as-goal is finally *front and center*: from S2L2 on, stars hinge on
finding the margin-maximizing knob position, and both early amp levels have a verified sweet
spot — max gain fails S2L2 outright and costs a star on S2L3. The thermometer trilogy
(Below Zero → Upside Down → S3's Clipped Cold) now carries *sign* end to end: signed input with
a positive weight, then a forced negative weight, then the clip that makes negatives silent.
The Σ introduction on the boss is unusual but works — "new part arrives for the boss fight" is
good game grammar, and Sector 03's datasheet re-teaches it immediately.

### Gap analysis
- **The sector opens on its difficulty spike.** S2L1 (difficulty 3) is the first knob
  interaction and demands the sector's second-hardest ★★★ — right after a gentle S1 boss.
  Defensible (the reveal needs the pain of raw units fresh), and softer than it looks: moving
  only "0 @" already solves the level for ★ (span only buys stars), so the cold open is
  effectively one dial for the solve and two for the polish. A playable km/h ↔ m/s toggle would
  still be the better warm-up.
- **The m/s counter-example is told, not played.** S2L1's briefing asserts that re-measuring in
  m/s flips the Penguin's raw verdict; the player can't switch units in-game. A km/h ↔ m/s
  toggle on the SPEED pin would turn the sector's strongest sentence into an experiment.
- **The normalizer never reappears.** After S2L1 inputs normalize automatically; the skill
  isn't reinforced. Acceptable (that's the point), but a "broken normalizer" repair level would
  cement it. (S4L3 Meltdown now names normalization as the cure for loud inputs, which at
  least closes the loop verbally.)
- **The rail-vs-bias equivalence** is now stated outright in the S3 datasheet ("the bias is the
  power-rail threshold you tuned last sector, moved inside the part") and enforced mechanically:
  from S3L2 on the rail is a frozen REF, so the gate's bias is the only bar. Closed.
- **Softmax** is now explained in the S1 datasheet (see Sector 01 gaps) — narrated, not played.

---

### S2L1 · Fair Race
- **Player description:** the trail cam reports raw units; in km/h vs s/m the 🐧 Penguin reads
  FAST — measured in m/s it flips to SLOW. "The scale decides, not the animal!" Set the
  NORMALIZER's "0 @" and "±1 @" dials and route a sensor through it. "From here on, inputs
  normalize automatically."
- **Hidden learning goal:** **normalization**: (x − zero)/span maps any measurement scale onto a
  common signal range; comparisons across differently-scaled sensors are meaningless until then.
  Secondary: first parameter-tuning experience (two dials).
- **Setup:** free wiring; a single NORMALIZER (N1: zero 0…8 km/h, span 0.25…8) — one is
  sufficient, since routing either sensor through it can separate the classes. Inputs display
  **raw** readings with one decimal;
  sig readouts still hidden (they turn on for good in the next level).
- **I/O:** SPEED, PACE (raw) → SLOW / FAST. Cards: Hedgehog[1.5, 2.4]→SLOW;
  Penguin[2.5, 1.4]→SLOW; Duck[5.0, 0.7]→FAST — three animals deliberately close in speed,
  straddling the km/h↔s/m crossover (3.6 km/h = 1 s/m).
- **Difficulty:** 3 (the sector's cold open; ★★★ = 0.88 requires a centered zero *and* a
  tight span).
- **Differs from previous:** first module on the board, first knobs, first multi-parameter
  reasoning.
- **Learning advance:** the concept is taught *by failure*, not narration — machine-checked: no
  normalizer-free wiring solves the level, and the naive SPEED→FAST + PACE→SLOW wiring fails on
  exactly the Penguin (raw 2.5 "beats" 1.4, yet the penguin is slow). The briefing's m/s
  counter-example (0.69 m/s loses to 1.4 s/m — same animal, opposite verdict) names the general
  principle: the unit, not the animal, was deciding. Caveats: see sector gaps — the cold-open
  spike and the never-reinforced normalizer both live here.

### S2L2 · Volume Knob
- **Player description:** "The wire is fixed — the knob is yours. A fixed amplifier (AMP ×1.2) holds a
  steady vote for COLD. Loud enough that Fire wins WARM, quiet enough that Breeze stays COLD —
  find the *right* volume, not the loudest."
- **Hidden learning goal:** weight = multiplier, **and the correct weight is a band, not
  "max"** — calibration. A frozen reference (a fixed AMP ×1.2 off the rail) gives the knob both a floor
  (Fire needs w > 1.2) and a ceiling (Breeze flips WARM past w ≈ 2.7); certainty peaks where
  the two cards' margins equalize (w ≈ 1.65).
- **Setup:** fixed wiring HEAT→A1→WARM; PWR→AMP(frozen ×1.2)→COLD as scenery. One live knob starting
  at **0** (board starts failing: COLD wins everything).
- **I/O:** HEAT, PWR(+1) → COLD / WARM. Cards: Fire[1.0]→WARM; Breeze[0.45]→COLD.
- **Difficulty:** 2.
- **Differs from previous:** first amp; first frozen part; first *non-monotone* knob — verified
  response: w<1.2 fails, ★★★ ≈ 1.5–1.9, degrades to ★, fails again past 2.7.
- **Learning advance:** the overshoot is the teacher — cranking to max visibly flips Breeze red,
  so "more gain ≠ more right" is learned by doing, one level after Fair Race taught the same
  shape (find the band) on the normalizer. Also quietly pre-seeds the rail-as-threshold: the AMP is
  factory scenery here, and S2L7 hands the player that exact knob.

### S2L3 · Whisper
- **Player description:** "A tiny spark whispers at signal 0.3 — amplify it past the fixed noise
  floor (AMP ×0.55). But careful: gain lifts everything, sensor Noise included."
- **Hidden learning goal:** amplification compensates for weak features — w×x is a *product*;
  small x needs large w (nothing solves below w ≈ 1.9). And amplification is **indiscriminate**:
  Noise[0.15] rides the same wire, so gain lifts signal and noise together — the SNR intuition.
- **Setup:** same topology as S2L2 (deliberately), quieter: fixed AMP at ×0.55.
- **I/O:** HEAT, PWR(+1) → COLD / WARM. Cards: Spark[0.3]→WARM; Noise[0.15]→COLD.
- **Difficulty:** 2.
- **Differs from previous:** where S2L2's overdrive *breaks* (a card flips), Whisper's overdrive
  only *dulls* — max gain still solves but earns ★★ (0.525), while ★★★ (0.54) lives at w ≈
  2.3–2.6. The pair teaches both failure modes of too-much-gain.
- **Learning advance:** the confidence ceiling survives from the old design (even perfectly
  tuned, a whisper never gets loud — ★★★ is only 54%) and the noise card makes the ceiling's
  *reason* tangible. Close margins are the fiction working, not a flaw.

### S2L4 · Below Zero
- **Player description:** "This thermometer reads −40° to +40° (signal −1 to +1). One knob must
  satisfy BOTH cards — feel what a negative signal does."
- **Hidden learning goal:** signed evidence: one weight serves two opposite verdicts because the
  *sign of the input* flips the vote. (Negative score < empty output ⇒ the other class wins.)
- **Setup:** fixed topology, one knob; two cards with opposite signs.
- **I/O:** THERMO (−40…40°) → COLD / WARM. Cards: Fire[+1]→WARM; Deep Freeze[−0.8]→COLD.
- **Difficulty:** 2.
- **Differs from previous:** first level where *one* parameter must satisfy *conflicting-looking*
  cards — resolved by understanding sign, not by compromise.
- **Learning advance:** important and well-built; the "aha" (cranking the knob helps BOTH cards)
  is counter-intuitive and memorable. Sets up ReLU clipping of negatives in S03.

### S2L5 · Upside Down
- **Player description:** "Same thermometer — but this time the wire is soldered into COLD and
  cannot be moved. A knob turned below zero flips every vote: a hot reading now argues *against*
  COLD, a freezing one argues *for* it. Invert the amplifier so all three days land right."
- **Hidden learning goal:** **negative weights**: the sign of a weight is part of the model. A
  wire routed to the "wrong" class is not a dead end — multiplying by a negative number makes the
  evidence argue the other way (an inhibitory connection). Callback to S1L2 Wrong Way: there the
  fix was *rewiring*; here rewiring is impossible and the fix is *the weight's sign*.
- **Setup:** fixed wiring THERMO→A1→COLD (the signed thermometer of S2L4); one knob, init ×1
  (board starts failing: Fire lights COLD).
- **I/O:** THERMO (−40…40°) → COLD / WARM. Cards: Fire[+1]→WARM; Mild Day[+0.3]→WARM;
  Deep Freeze[−0.8]→COLD.
- **Difficulty:** 2.
- **Differs from previous:** identical sensor and near-identical deck to Below Zero, but the
  wire goes to the *other* LED — the only thing that changes is which way the knob must turn.
  Machine-checked: no positive weight solves it; the optimum is the full −3 (minConf 0.71,
  ★★★ 0.70, ★★ 0.62).
- **Learning advance:** closes the sector's old gap (negative weights were never required before
  the S3 boss). The Mild Day card gives the knob something to *push for* — at −3 it sits at 71%,
  so "further below zero = louder" is felt, not told. Also the reason the S3 boss can now start
  its cold-side amp at +1 and expect the player to flip it.

### S2L6 · Sweet & Spicy
- **Player description:** "Two flavors, two amps, free wiring. Balance the knobs so all four
  snacks are judged right."
- **Hidden learning goal:** *fitting*: multiple weights jointly constrained by a dataset with a
  deliberately conflicting example (Spicy Mango is sweet AND spicy) — you balance, not maximize.
- **Setup:** free wiring returns; two amps (both start at ×1). Correct wiring alone is *not*
  enough — Spicy Mango[0.6, 0.75] reads sweeter than hot, so untouched (or any equal) knobs
  call it MILD. And no *single* knob suffices either: Chili Jam punishes a lone loud A1
  (0.85·A2 must beat 0.35·A1) while Sugar Cube's confidence rides purely on A2's magnitude,
  so both dials must move to score.
- **I/O:** CAPSAICIN, SUGAR → MILD / SPICY. 6 cards: Habanero[1.0, 0.1]→SPICY;
  Mango[0.05, 0.9]→MILD; Chocolate[0, 0.8]→MILD; Spicy Mango[0.6, 0.75]→SPICY;
  Chili Jam[0.35, 0.85]→MILD; Sugar Cube[0, 0.3]→MILD.
- **Difficulty:** 3–4.
- **Differs from previous:** first combination of structural (wiring) and parametric (two knobs)
  choices; first *interacting* constraints between weights — now genuinely two-sided (A1 has a
  floor from Spicy Mango and a ceiling from Chili Jam, relative to A2).
- **Learning advance:** the sector's intellectual core — "training data pushes weights against
  each other" — experienced by hand, and now unskippable in both directions. Machine-checked
  ceilings: A1 alone (A2 stuck at 1) caps at minConf 0.564 and A2 alone at 0.538, both below
  ★★ (0.57), so single-knob play earns 1★ at best; the verified optimum (A1≈3, A2≈1.75,
  minConf 0.61) requires committing both dials, ★★★ at 0.59. (The A2-pinned ceiling is now
  a standing verifier check.)

### S2L7 · The Power Rail
- **Player description:** "The PWR rail is always on — you have seen it hold factory
  references. Now its knob is yours: set the threshold so you go out unless the clouds beat
  the rail."
- **Hidden learning goal:** **bias, disguised**: a constant×weight term sets a decision
  threshold independent of the evidence. (Formally: the bias trick, b ≡ w·1.)
- **Setup:** fixed wiring CLOUDS→A1→STAY IN, PWR→A2→GO OUT; two knobs.
- **I/O:** CLOUDS, PWR(+1) → GO OUT / STAY IN. Cards: Clear[0.05], Drizzle[0.55], Storm[0.95].
- **Difficulty:** 2–3 (Drizzle at 0.55 forces the rail to sit *between* clear and drizzle).
- **Differs from previous:** the rail knob is finally *live* — S2L2/S2L3 showed it as a frozen
  AMP, so this is a reveal of agency, not of a part; first explicitly threshold-shaped problem
  (where does the boundary go?).
- **Learning advance:** quietly one of the most important levels in the game — every later use
  of bias stands on it. Placement before the Σ/gate sector is exactly right. It is also the
  *last* time the rail is a knob: S3L1 uses it once more as the calm reference, then the S3
  datasheet freezes it and hands the same job to the gate's bias.

### S2L8 · Night Shift — BOSS
- **Player description:** "A new part hits the tray: the Σ junction — the only place wires may
  merge. Sleepy only when it's night AND there's no coffee. ALERT needs two voices: merge them
  through Σ."
- **Hidden learning goal:** evidence *combination*: a class score can need multiple summed
  terms (coffee evidence + threshold rail); Σ is where addition happens. Structurally this is
  the player's first two-term linear function — half a neuron.
- **Setup:** free wiring; 3 amps + 1 Σ, all amps starting at ×0 (correct wiring alone leaves
  every meter dead — the knobs must be raised). Intended circuit: NIGHT→A1→SLEEPY;
  COFFEE→A2→Σ; PWR→A3→Σ; Σ→ALERT. Wiring rule enforced: outputs and component inputs accept
  one wire; only Σ merges.
- **I/O:** COFFEE, NIGHT, PWR → SLEEPY / ALERT. 4 cards covering the truth table of
  "sleepy = night ∧ ¬coffee."
- **Difficulty:** 4. Six wires + three knobs + a brand-new part; the logic (why ALERT needs the
  rail at all) is genuinely non-obvious until Fresh Morning fails.
- **Differs from previous:** first Σ; first board where the *shape* of the computation (which
  terms sum) is the puzzle, not just which wires exist.
- **Learning advance:** strong boss. Composes all five sector ideas and manufactures the need
  for Sector 03 (the assembled "amp+amp+rail+Σ" is one bias short of a neuron). The known rough
  edge: Σ arrives mid-boss with one sentence of introduction; S3L1 immediately re-teaches it
  from scratch, which softens but slightly duplicates.

---

# Sector 03 · BIAS & ReLU — “the gate decides what passes”

### Sector learning goals
1. **Σ junction consolidation** (re-taught calmly after the boss cameo).
2. **Bias as a learnable threshold** inside a unit (not just an external rail).
3. **ReLU:** everything below zero is clipped to exactly 0 — units are silent, never negative.
4. **Threshold logic:** with weights+bias+ReLU you can build AND, OR, and detectors.
5. **Composition of units (boss):** some functions (a band / "middle" detector) are *provably
   impossible* with one unit and require two — the reason hidden layers exist.

### Coverage assessment
Conceptually the richest sector, and mostly well-sequenced: junction → threshold → clipping →
AND → OR → two-gate composition. The AND/OR pairing ("same chip, different bar") is an elegant
teaching beat. The boss delivers the single most important idea in the whole game (one unit
can't do a band; two can) and lands it by construction rather than lecture.

**Design rule of the sector (new):** from S3L2 on the PWR rail is a frozen **REF ×1** and the
gate's bias is the only movable bar. Before this pass the rail was a live knob on every gate
board, and because a rail threshold and a pre-clip bias are interchangeable on a single chain,
Smoke Test and the AND Gate were both ★★★-solvable with the bias left at 0 — the sector's
headline concept was optional. Freezing the rail makes bias *the* mechanism (verifier-pinned:
bias untouched now caps at 0.596 / 0.565, both below ★★), matches Sector 04 where REF is
always frozen, and reads naturally in the datasheet ("the threshold you tuned last sector,
moved inside the part").

### Gap analysis
- **Negative weight requirement** — closed by S2L5 Upside Down; the boss now starts its
  cold-side amp at **+1** and expects the player to flip it (the briefing hints "remember which
  way an amp must turn to fire when the reading is low").
- **Fixed wiring after L1** — partly restored: S3L4 The AND Gate is now free-wiring (the player
  builds the two-amps-into-one-gate topology; gates accept merged wires like Σ, per the
  datasheet's "junction with attitude"). S3L5 stays fixed *on purpose* — "the board arrives
  wired exactly as you built the AND gate" is the point. S3L2/L3/L6 remain fixed to isolate
  their concepts; the train levels of S04 are fixed too, so the builder muscle still rests for
  the last stretch of the game. A "choose the topology, then train" level is the open item.
- **ReLU's *purpose* is asserted, not yet earned.** Players see clipping behavior (S3L3) but
  the reason networks *want* nonlinearity only fully lands at the boss. The boss briefing now
  foreshadows it ("a gate only ever fires *more* as its input rises"); S3L6 *is* the
  demonstration.
- **XOR is absent.** Comfort Zone (a band) is the game's stand-in for "linearly inseparable."
  Fine for now; a true XOR level is the natural future boss for a hidden-layer sector.

---

### S3L1 · The Junction
- **Player description:** "Wind alone is fine. Rain alone is fine. Together they make a storm.
  Wire both sensors into the Σ junction — it simply adds — and tune the calm rail."
- **Hidden learning goal:** summation as evidence accumulation; a threshold (rail) turns a sum
  into a decision. Also: Σ has *no parameters* — addition is structure, not knowledge.
- **Setup:** free wiring; 1 Σ + 1 amp (rail, starts at ×0 so wiring alone reads everything
  STORM). Cards: Clear[0.1, 0.1], Windy Day[0.9, 0.1], Rain Shower[0.1, 0.9] → CALM;
  Full Storm[0.9, 0.9] → STORM — singles sum to 1.0, the storm to 1.8; the rail must be raised
  into the gap (optimum ×1.4, minConf 0.60; ★★★ 0.59, ★★ 0.55).
- **I/O:** WIND, RAIN, PWR → CALM / STORM. 4 cards.
- **Difficulty:** 2.
- **Differs from previous:** Σ as the *subject* rather than a boss surprise; the first
  "conjunction by accumulation" framing (soft-AND before the crisp AND of S3L4).
- **Learning advance:** good consolidation; also quietly demonstrates that thresholding a sum is
  clumsy with a rail — motivating the gate's built-in bias one level later. The deck was
  re-cut in this pass: previously the storm was *windier* than the windy day (0.9 vs 0.45), so
  WIND→STORM alone solved the level for ★ and Σ was decorative. Now the windy day is exactly as
  windy as the storm, so no single sensor separates the classes and Σ is the only route
  (verifier: the Σ-less shortcut cannot pass all cards).

### S3L2 · Smoke Test
- **Player description:** "Sound the ALARM only for real fires. The QUIET reference is fixed at
  ×1 — the only bar you own is the gate bias. Amplify the smoke, then set the bias so toast and
  candles die at the gate."
- **Hidden learning goal:** **bias inside the unit**: GATE = Σ + b + clip; a negative bias is a
  bar that weak evidence cannot clear, and clipped evidence is *exactly zero* (silent, not
  faint).
- **Setup:** fixed chain SMOKE→A1→G1→ALARM with PWR→REF(frozen ×1)→QUIET; two knobs (w, b).
- **I/O:** SMOKE, PWR → QUIET / ALARM. Cards: Toast .2 / Candle .35 / Stove .8 / Blaze .95.
- **Difficulty:** 3.
- **Differs from previous:** first GATE; first two-stage chain (amp feeding gate) — the layered
  wire animation makes the sequential computation visible here for the first time in anger;
  first frozen REF on a gate board (the rule for the rest of the sector).
- **Learning advance:** the bias concept lands well because the failure mode (candle triggering
  the alarm) is intuitive. Verified: with the bias pinned at 0 the amp alone caps at 0.596
  (★ only); the optimum A1≈3, b≈−0.7 gives 0.66 (★★★ 0.65). Good difficulty step.

### S3L3 · Clipped Cold
- **Player description:** "The thermometer goes below zero — but the gate clips negatives to 0:
  a gated WARM can go silent, never negative. Let the fixed reference speak for COLD, and use
  the bias to lift the mild days over it."
- **Hidden learning goal:** ReLU asymmetry: a unit can only *support* its class, never argue
  against it; negative evidence must be handled by *other* paths (here, the default reference).
  Direct callback to S2L4/S2L5 — same thermometer, third behavior.
- **Setup:** fixed chain THERMO→A1→G1→WARM, PWR→REF(frozen ×1)→COLD; two knobs (w, b). The
  optimum uses a *positive* bias (A1=3, b=0.7 → 0.71) — the first time bias is a head start
  rather than a handicap; with b pinned at 0 the amp caps at 0.55 (★ only).
- **I/O:** THERMO, PWR → COLD / WARM. Cards: Fire, Mild Day, Chill(−0.2), Deep Freeze(−0.9).
- **Difficulty:** 3.
- **Differs from previous:** deliberately re-uses S2L4's setting to contrast raw weights
  (negative score possible) vs gated units (floor at 0) — the only explicit A/B contrast level
  in the game.
- **Learning advance:** high. Understanding "silent ≠ opposed" is essential for reading real
  ReLU networks, and the contrast framing makes it stick.

### S3L4 · The AND Gate
- **Player description:** "Sprinkle only when it is hot AND dry. Build it yourself: a gate sums
  like Σ, so both amps feed one gate, and the gate drives SPRINKLE. Then set the bar so a single
  ingredient is never enough."
- **Hidden learning goal:** threshold logic I: conjunction = high bar over a sum. A single
  linear unit computes AND when bias ≈ −(w₁+w₂)+margin. Secondary: the gate *is* a junction —
  the player merges two wires into it, the first merge since Night Shift.
- **Setup:** **free wiring** (restored): two amps, one gate, frozen REF ×1 → SAFE pre-wired.
  Intended topology HEAT→A1→G1, DRYNESS→A2→G1, G1→SPRINKLE; three knobs (w₁, w₂, b).
- **I/O:** HEAT, DRYNESS, PWR → SAFE / SPRINKLE. Cards = the 2×2 truth table.
- **Difficulty:** 3–4 (five wires plus three interacting knobs).
- **Differs from previous:** the gate now *merges* (two feeds) — combining Σ-thinking with
  bias-thinking in one part; complete truth-table dataset for the first time; first time the
  player wires a gate.
- **Learning advance:** classic perceptron-logic material, correctly placed. The Hot&Humid /
  Cool&Dry near-miss cards do the teaching. Verifier-checked ceilings: sensors wired straight
  into the gate (no amps) cap at 0.587, bias pinned at 0 caps at 0.565 — both below ★★ (0.62);
  the optimum (A≈2.8/2.8, b=−3) reaches 0.73 (★★★ 0.68). Before this pass the rail knob could
  do the bias's job (★★★ with b=0); see the sector design rule.

### S3L5 · The OR Gate
- **Player description:** "Porch light ON if the door opens OR motion is seen. The board arrives
  wired exactly as you built the AND gate — same chip, different bar."
- **Hidden learning goal:** threshold logic II: OR is the *same architecture* with a lower bar —
  logic lives in the parameters, not the structure. (The deepest single sentence in the game.)
- **Setup:** identical topology to S3L4, now *pre-wired* (the player just built it); frozen
  REF ×1; different dataset. Three knobs.
- **I/O:** DOOR, MOTION, PWR → OFF / LIGHT ON. Truth-table cards.
- **Difficulty:** 3 (easier than AND because the player has the template).
- **Differs from previous:** *nothing structural* — which is the point. First "same board, new
  function via retuning" level. ★★★ raised to 0.72 so the bias must be nudged just *below* zero
  (≈ −0.2…−0.7) to clip Quiet Night to exact silence — the AND bar was −3, the OR bar is a hair
  under 0; the optimum is 0.73.
- **Learning advance:** excellent value for its cost. The AND→OR pair is the argument for
  learning-by-parameters, i.e. the argument for training — one sector before training arrives.

### S3L6 · Comfort Zone — BOSS
- **Player description:** "Cozy only in the middle temperatures. One gate can't do it: a gate
  only ever fires *more* as its input rises. So use two — a too-cold gate and a too-hot gate —
  summed at Σ into UNCOMFY. Remember which way an amp must turn to fire when the reading is
  *low*."
- **Hidden learning goal:** **capacity limits & composition**: a monotone unit cannot detect a
  band; two opposed detectors (one on a negated input) summed through Σ can. This is the
  hidden-layer argument, and the first *applied* negative weight since S2L5 (A1 must reach
  ≈ −3 from a factory +1).
- **Setup:** fixed; TEMP fans into two amp→gate chains, both gates → Σ → UNCOMFY, frozen REF
  ×1 → COZY. Four knobs (A1 starts at **+1**, so the player must invert it; previously it
  shipped at −1, which gave the insight away). Cozy band deliberately narrow (0.48/0.52) so
  gates must be steep. The two gates merge through an explicit Σ now — before this pass they
  were wired straight into the same output, contradicting the "wires merge only at Σ" rule
  the player was taught in Night Shift; the board is also the first three-row layout.
- **I/O:** TEMP, PWR → COZY / UNCOMFY. Cards: Freezing, Just Right, Comfy Eve, Scorching.
- **Difficulty:** 5 (requires understanding *why* the structure is what it is, and applying the
  negative weight unprompted).
- **Differs from previous:** first two-unit cooperative solution; first "impossible with less"
  construction; first board where a part must be turned *against* its factory sign.
- **Learning advance:** the curriculum's keystone. A player who understands this board
  understands why depth exists. Fine-grid optimum is 0.634, but the region above 0.62 is a
  needle, so ★★★ is set at **0.60** (★★ 0.55) — still the tightest hand-tune in the game. The
  negative-amp step is no longer cold: S2L5 taught it, the briefing hints at it, and the tip
  states it.

---

# Sector 04 · THE NEURON — “amps + gate in one chip — and it learns”

### Sector learning goals
1. **Chunking:** the amp+Σ+bias+clip assembly is one named unit — the neuron (w·x + b, ReLU).
2. **Training:** gradient descent adjusts weights automatically from labeled cards; the player's
   role shifts from *tuning parameters* to *supervising learning*.
3. **Learning rate:** step size trades speed against stability; too hot diverges.
4. **Data scale interacts with learning rate** (loud inputs amplify steps) — the practical echo
   of Sector 01's normalization.
5. **Multi-class training:** one neuron per class, trained jointly, each specializing.
6. **Efficiency as skill:** epoch pars make "how you train" the scored quantity.

### Coverage assessment
Goals 1–6 all have a dedicated level and the verified learning-rate curves genuinely produce the
intended phenomena (S4L2: lr 0.1 → 5 epochs, lr ≥ 0.3 → unreliable; S4L3: cliff at 3.0).
The sector converts the previous 18 levels of hand-tuning into motivation — by now the player
*knows* how tedious knobs are, so TRAIN feels like magic with understood internals. The
weight-LEDs moving on their own is the game's best single image — and it now opens on the
player's *own* AND board, so the first thing gradient descent does is rediscover the bar they
set by hand one sector earlier.

**Design rule of the sector (new):** every unlocked throttle starts at a setting that does *not*
reach ★★★ (verifier rule c). Before this pass, S4L2, S4L4 and the boss all earned ★★★ at their
factory learning rate — "you set the learning rate" was never actually required. Factory
settings are now: S4L2 0.02 (a crawl, 20 epochs), S4L4 0.1 (23 epochs, ★★), S4L5 1.0 (wide
open: thrashes/never converges on the close data). Each is a different wrong, on purpose.

### Gap analysis
- **"Epoch" and "loss"** — now defined in the NRN datasheet ("one epoch = one pass over every
  card; loss = how wrong the chip still is, summed over the deck — training drives it down").
  Closed.
- **The neuron↔assembly equivalence** — now shown: S4L1 *is* the S3L4 sprinkler board with the
  two amps and the gate fused into U1, shipped tuned as the OR gate (w≈3, b=0). Training pulls
  b to ≈ −1.5 in exactly 10 epochs on every seed; the b LED turning red is the bar the player set
  by hand in S3L4/S3L5. Closed.
- **Training is a black box at the update level** — intentional at this stage, but nothing yet
  visualizes "nudge direction = reduce error." Future sector material.
- **No generalization concept.** All cards are training cards; nothing is held out. Test sets,
  overfitting, and validation are absent from the entire game (they exist in the level design
  *verification*, ironically). This is the largest curriculum-level gap and the natural Sector 05.
- **Structure is frozen in all train levels** — the player last placed a wire in S3L4. A
  "choose the topology, then train" level (e.g., Three Bins with the chips unwired) is the
  natural fix; the wiring UI already supports neuron pads.

---

### S4L1 · It Learns!
- **Player description:** "Your sprinkler board is back — the two amps and the gate fused into
  one chip, U1. It ships tuned as the OR gate (bias at zero). Press TRAIN and watch the LEDs
  move: the chip finds the AND bar on its own."
- **Hidden learning goal:** training exists: parameters can be *learned from labeled data* —
  and the thing being learned is *exactly* the thing the player tuned by hand (goal 1, the
  chunking, made experiential). Zero-decision demo — locked learning rate, guaranteed
  convergence (verified 10 epochs on every seed).
- **Setup:** fixed wiring HEAT,DRYNESS→U1→SPRINKLE with frozen REF ×1 → SAFE — the S3L4 board.
  Neuron starts as the *OR* solution (w=[2.8, 3.0], b=0) so training has one visible job:
  drive b below zero. LR locked 0.1. Ends near w≈[2.1, 2.3], b≈−1.5.
- **I/O:** HEAT, DRYNESS, PWR → SAFE / SPRINKLE. The 2×2 truth-table cards of S3L4.
- **Difficulty:** 1 (deliberately; ★★★ automatic).
- **Differs from previous:** first TRAIN button, epoch counter, loss sparkline, weight LEDs;
  the player's hands leave the knobs for the first time — on a board they know by heart.
- **Learning advance:** the reveal level — payoff of 18 levels of manual labor, now with a
  direct before/after: OR bar → AND bar, by descent. Correctly frictionless.

### S4L2 · The Throttle
- **Player description:** "A fresh board, and now you set the learning rate — it starts at a
  crawl. Bigger steps learn faster… up to a point. Beat the par!"
- **Hidden learning goal:** learning rate: monotone-faster is false; there is a sweet spot, and
  beyond it training becomes unreliable (verified over 12 seeds: 0.02→20ep, 0.05→8, 0.1→5,
  0.2→13, ≥0.3→∞ on some seeds).
- **Setup:** new sky board (CLOUDS, HUMID → DRY / RAIN), 6 cards, LR slider unlocked (0.01…3,
  log scale), **factory 0.02** — reliably ★★ (20 epochs), never ★★★, so the slider must move.
  Par ★★★ ≤12 epochs requires lr ∈ [0.05, 0.2].
- **Difficulty:** 2–3 (experimentation loop: train → reset → adjust).
- **Differs from previous:** first player-controlled hyperparameter; first use of RESET as a
  legitimate strategy; stars now measure *training skill*, not circuit quality.
- **Learning advance:** strong — the level's dynamics are real (measured), so the lesson learned
  is true, not scripted. Both failure directions are one slider-flick away: the crawl the board
  starts in, and the ∞ above 0.3. (The old tip "crank the throttle — this board can take a hot
  learning rate" pointed players straight at the divergent range; replaced.)

### S4L3 · Meltdown
- **Player description:** "These sensors are loud (big numbers, never normalized). Loud inputs
  make every training step bigger, so a hot learning rate will overshoot and thrash — find the
  sweet spot. (This is why real networks normalize first — remember Fair Race.)"
- **Hidden learning goal:** data scale × learning rate interaction: unnormalized ("loud") inputs
  multiply the effective step size; the stable LR range shifts down and a cliff appears (lr 3.0
  diverges; ★★★ ≤3 epochs demands riding near the cliff at lr ≈ 0.8–1.5). Thematic closure of
  the normalization thread from S2L1.
- **Setup:** same topology; features up to 2.8 (geiger counts); eager init (w=[2.5,2.5]) so
  training must pull *down*; reference rail at ×2.
- **I/O:** GEIGER(cps), HEAT → STABLE / EVACUATE. 4 cards.
- **Difficulty:** 4 (★★★ window is tight and risky by design — the "ride close, don't go over"
  risk/reward is the game's most gamified moment).
- **Differs from previous:** first level where the *data* is the hazard; first tight-window par.
- **Learning advance:** teaches a genuinely practical instinct (scale ↔ step size). The briefing
  now says the quiet part out loud — loud inputs are why networks normalize — closing the
  thread opened in Fair Race. Factory throttle 0.2 → 7 epochs (★★), so the cliff must be
  approached deliberately for ★★★.

### S4L4 · Three Bins
- **Player description:** "Three chips, three bins — each neuron champions one fruit bin.
  Train them all at once and watch them specialize. The throttle starts low: pick your own pace
  for the par."
- **Hidden learning goal:** multi-class learning: one unit per class trained simultaneously;
  units *specialize* (visible as diverging LED patterns); softmax competition drives them apart.
- **Setup:** fixed; U1/U2/U3 each fed SWEET+SIZE, each wired to its own bin; asymmetric inits
  break symmetry. LR free, factory 0.1 (23 epochs → ★★); ★★★ ≤15 epochs needs ≥0.2.
- **I/O:** SWEET, SIZE → BERRY / CITRUS / MELON. 6 fruits.
- **Difficulty:** 3.
- **Differs from previous:** first multi-neuron board (the first true *layer*); first 3-class
  training; no PWR rail — classes defend themselves.
- **Learning advance:** the "watch them specialize" moment is the payoff; connects back to the
  Great Race boss (same 3-way shape, now learned instead of wired).

### S4L5 · Chip Factory — BOSS
- **Player description:** "Same three bins, trickier fruit — Kiwi and Orange sit right on the
  berry/citrus line. The factory throttle is wide open; on close data that thrashes. Find the
  pace that ships boards fast: tight epoch budget for ★★★."
- **Hidden learning goal:** everything at once under pressure: harder (closer) class boundaries
  narrow the viable LR window (verified over 12 seeds: 0.2–0.8 converge; ★★★ ≤20 needs
  0.2–0.5, with 0.3 the sweet spot at ~10 epochs; 1.0 and above stall). "A mid throttle beats a
  wild one on tricky data" = implicit regularization intuition.
- **Setup:** as S4L4 plus Kiwi and Orange squeezed near the berry/citrus boundary (8 cards).
  **Factory throttle 1.0** — the first press of TRAIN thrashes (loss sparkline jumping, cards
  flickering) and never settles; the player has to pull it back. Seed variance is real here
  (30-seed spread at 0.3: median 6, worst 25), so RESET-and-retry is a legitimate part of the
  boss, as the NRN datasheet promises ("know when to reset").
- **Difficulty:** 5.
- **Differs from previous:** same board, harder *data* — the boss twist is purely in the
  dataset, closing the game on the thesis that data shapes everything; first level whose
  factory setting is *too hot* rather than too slow.
- **Learning advance:** a fitting finale for the current arc: the player leaves having
  hand-built a neuron from parts (S1–S3) and then trained fleets of them under real dynamics
  (S4). The known miss: no unseen-card test at the very end to prove the learned bins
  *generalize* — the strongest possible cliffhanger for Sector 05.

---

# Cross-curriculum assessment

**What the arc does well**
- A single coherent metaphor (PCB) carries every concept with no vocabulary resets.
- Genuine constructionism: nothing is animated-for-show; every meter, LED, and epoch count is
  the real verified engine, so lessons learned by experimentation are *true*.
- The manual→automatic arc (18 levels of knobs → TRAIN) manufactures the motivation for
  gradient descent instead of asserting it — and the first trained board is the player's own
  hand-built AND gate.
- Every level is machine-verified solvable with achievable star bars, none solvable by
  inaction, and — since this pass — none solvable *without its own lesson*: the new part cannot
  be bypassed (S3L1, S3L4), the lesson knob cannot be left alone (S3L2, S3L4, S2L6), and the
  factory throttle never reaches ★★★ (S4L2–L5).
- The threshold concept has one continuous lineage: PWR rail as a frozen reference (S2L2/L3) →
  the rail as *your* knob (S2L7) → the rail as the calm bar over a Σ (S3L1) → the bar moves
  inside the gate as *bias*, rail frozen to REF (S3L2–L6) → the neuron's *b*, learned (S4).
- Sign has its own lineage: signed input × positive weight (S2L4) → forced negative weight
  (S2L5) → negatives clipped to silence (S3L3) → a negative amp as a deliberate design choice
  (S3L6 boss).

**Closed in this pass** (kept for the record): softmax explained in the S1 datasheet and Great
Race briefing (narrated, see gap 2); negative-weight inversion level (S2L5); epoch/loss defined;
neuron↔assembly bridge (S4L1); rail↔bias equivalence stated and enforced; Σ-less and bias-less
shortcuts removed from S3L1/S3L2/S3L4; throttle made mandatory in S4; free wiring restored in
S3L4; S3L6's two gates merge through Σ as the rules say.

**Ranked list of open gaps** (candidates for the next content pass)
1. **Generalization / held-out cards** — absent entirely; natural Sector 05 ("QA Bench": train
   on the deck, get graded on sealed cards; overfitting as a boss). Needs engine support for a
   sealed card set and a "reveal at FINISH" UI.
2. **Softmax / % meters are explained, not played** — a half-level where two raw scores become
   percentages would turn the datasheet sentence into an experiment.
3. **No wiring in Sector 04** — a "choose the topology, then train" level (Three Bins with
   unwired chips); the neuron pads already accept drags.
4. **S2's cold open** — Fair Race (difficulty 3, first knobs) is the first thing after the
   gentle S1 boss; ★ needs only the "0 @" dial, but a playable km/h ↔ m/s toggle would make the
   briefing's strongest sentence an experiment.
5. **XOR** — reserved for a future hidden-layer sector; Comfort Zone currently carries the
   inseparability idea alone.
6. **Training is a black box at the update level** — nothing visualizes "nudge direction =
   reduce error"; future sector material.

**Difficulty curve (levels in order):**
1 · 1 · 2 · **2** ‖ 3 · 2 · 2 · 2 · 2 · 3 · 3 · **4** ‖ 2 · 3 · 3 · 4 · 3 · **5** ‖ 1 · 3 · 4 · 3 · **5**
Sector 01 is a uniformly gentle on-ramp ending in a soft boss. Sector 02 opens on its
thesis-statement spike (Fair Race) and then runs a flat 2-2-2-2 through the single-knob amp
levels (Upside Down slots into that plateau as a one-knob level) before climbing to the boss.
Sector 03's boss lost a knob (rail frozen) but gained the unprompted sign flip, so it stays a 5.
Sector 04's flat 1-start is the post-boss breather, now on familiar ground.
