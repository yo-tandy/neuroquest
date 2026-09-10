/* NeuroQuest — chapters & levels for the vertical slice (Sectors 01-02).
   Star thresholds are verified by sim (see verify.mjs): ★ = solve,
   ★★/★★★ = minimum-confidence thresholds proven achievable. */
(function (root) {
  'use strict';

  const CHAPTERS = [
    {
      key: 'S1',
      num: 1,
      title: 'Signals',
      tagline: 'electricity in, decisions out',
      part: 'SIG-00',
      datasheet: {
        lead: 'A network is a board where <b>signals flow</b> from input pins to ' +
              'output LEDs. Every output collects the signal routed into it — ' +
              'and the <b>strongest output wins</b> the decision. The meters split ' +
              '<b>100%</b> between the LEDs: equal scores read 50/50, and the further ' +
              'one score pulls ahead, the <b>surer</b> the board is — that certainty ' +
              'is what earns stars. Your first job: route the right evidence to the right LED.',
        symbol: 'wire',
        specs: [['NORMALIZED SIGNAL', '−1.0 … +1.0'], ['LEVELS IN SECTOR', '4'], ['MAX STARS', '12 ★']]
      },
      levels: [
        {
          id: 's1l1', name: 'First Sprint', noSig: true,
          goal: 'Wire the speed pin to <b>FAST</b> so the board lights the right LED for the 🐇 Hare.',
          inputs: [{ key: 'SPEED', icon: '💨', unit: ' km/h', scale: 70 }],
          outputs: [{ key: 'SLOW', icon: '🦥' }, { key: 'FAST', icon: '⚡' }],
          comps: [],
          fixedWires: [],
          freeWiring: true,
          cards: [{ name: 'Hare', icon: '🐇', f: [1.0], label: 1 }],
          stars: { s2: 0.6, s3: 0.73 },
          tip: 'One clean wire, straight to FAST.'
        },
        {
          id: 's1l2', name: 'Wrong Way', noSig: true,
          goal: 'A previous engineer wired SPEED into <b>SLOW</b> — no wonder the 🐘 Elephant fails: it actually charges at 40 km/h! <b>Tap the bad wire</b> to remove it, then route it right.',
          inputs: [{ key: 'SPEED', icon: '💨', unit: ' km/h', scale: 40 }],
          outputs: [{ key: 'SLOW', icon: '🦥' }, { key: 'FAST', icon: '⚡' }],
          comps: [],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'out', p: 0 } }
          ],
          freeWiring: true,
          cards: [{ name: 'Elephant', icon: '🐘', f: [1.0], label: 1 }],
          stars: { s2: 0.6, s3: 0.73 },
          tip: 'Delete the bad wire first — then rebuild.'
        },
        {
          id: 's1l3', name: 'Tortoise & Hare', noSig: true,
          goal: 'Two sensors, two LEDs. <b>SPEED</b> (km/h) grows when an animal is fast — <b>PACE</b> (seconds per meter) grows when it is slow. Route <b>each kind of evidence</b> to the LED it supports.',
          inputs: [
            { key: 'SPEED', icon: '💨', unit: ' km/h', scale: 70, dec: 1 },
            { key: 'PACE', icon: '🐾', unit: ' s/m', scale: 12, dec: 1 }
          ],
          outputs: [{ key: 'SLOW', icon: '🦥' }, { key: 'FAST', icon: '⚡' }],
          comps: [],
          fixedWires: [],
          freeWiring: true,
          cards: [
            { name: 'Hare', icon: '🐇', f: [1.0, 0.008], label: 1 },
            { name: 'Tortoise', icon: '🐢', f: [0.004, 1.0], label: 0 }
          ],
          stars: { s2: 0.6, s3: 0.72 },
          tip: 'SPEED speaks for FAST, PACE speaks for SLOW.'
        },
        {
          id: 's1l4', name: 'The Great Race', boss: true, noSig: true,
          goal: 'BOSS · Three detectors, three verdicts: <b>quick as a fox</b>, <b>walks like a duck</b>, <b>crawls like a snail</b>. Route all three so <b>every animal</b> gets the right call. With three LEDs the meters split <b>three ways</b> — here 50% is a confident call.',
          inputs: [{ key: 'FOX-LIKE', icon: '🦊' }, { key: 'DUCK-LIKE', icon: '🦆' }, { key: 'SNAIL-LIKE', icon: '🐌' }],
          outputs: [{ key: 'FAST', icon: '⚡' }, { key: 'MODERATE', icon: '🚶' }, { key: 'SLOW', icon: '🦥' }],
          comps: [],
          fixedWires: [],
          freeWiring: true,
          cards: [
            { name: 'Hare', icon: '🐇', f: [1, 0, 0], label: 0 },
            { name: 'Fox', icon: '🦊', f: [1, 0, 0], label: 0 },
            { name: 'Duck', icon: '🦆', f: [0, 1, 0], label: 1 },
            { name: 'Snail', icon: '🐌', f: [0, 0, 1], label: 2 },
            { name: 'Chicken', icon: '🐔', f: [0.1, 0.9, 0], label: 1 },
            { name: 'Pig', icon: '🐖', f: [0.2, 0.8, 0], label: 1 },
            { name: 'Tortoise', icon: '🐢', f: [0, 0.2, 0.8], label: 2 }
          ],
          stars: { s2: 0.46, s3: 0.5 },
          tip: 'Each detector feeds exactly one verdict.'
        }
      ]
    },

    {
      key: 'S2',
      num: 2,
      title: 'Weights',
      tagline: 'every wire has a volume knob',
      part: 'WGT-01',
      datasheet: {
        lead: 'Wires only <b>route</b> signals — parts <b>change</b> them. A NORMALIZER puts ' +
              'any raw reading on a common scale, and an <b>amplifier</b> multiplies its ' +
              'signal by a <b>weight</b>: crank it up and the signal shouts; drop it below ' +
              'zero and it <b>argues against</b>. Training a network = tuning thousands of ' +
              'these knobs. Today you tune them by hand.',
        symbol: 'amp',
        specs: [['WEIGHT RANGE', '−3.0 … +3.0'], ['LEVELS IN SECTOR', '8'], ['MAX STARS', '24 ★']]
      },
      levels: [
        {
          id: 's2l1', name: 'Fair Race', noSig: true,
          goal: 'The trail cam reports <b>raw units</b>. In km/h vs s/m the 🐧 Penguin reads FAST — measure in m/s instead and it flips to SLOW. <b>The scale decides, not the animal!</b> A <b>NORMALIZER</b> fixes a scale: set <b>0 @</b> (the reading that becomes signal 0) and <b>±1 @</b> (how much makes a full signal). Route a sensor through the normalizer — tuned right, the units stop mattering. From here on, inputs normalize <b>automatically</b>.',
          inputs: [
            { key: 'SPEED', icon: '💨', unit: ' km/h', scale: 1, dec: 1 },
            { key: 'PACE', icon: '🐾', unit: ' s/m', scale: 1, dec: 1 }
          ],
          outputs: [{ key: 'SLOW', icon: '🦥' }, { key: 'FAST', icon: '⚡' }],
          comps: [
            { id: 'N1', type: 'norm', label: 'N1', params: {
              zero: { min: 0, max: 8, init: 0, step: 0.5, unit: ' km/h', dec: 1 },
              span: { min: 0.25, max: 8, init: 4, step: 0.25, unit: ' km/h', dec: 2 } } }
          ],
          fixedWires: [],
          freeWiring: true,
          cards: [
            { name: 'Hedgehog', icon: '🦔', f: [1.5, 2.4], label: 0 },
            { name: 'Penguin', icon: '🐧', f: [2.5, 1.4], label: 0 },
            { name: 'Duck', icon: '🦆', f: [5, 0.7], label: 1 }
          ],
          stars: { s2: 0.7, s3: 0.88 },
          tip: 'Put 0 @ between the Penguin and the Duck, then shrink ±1 @ until the verdicts get loud.'
        },
        {
          id: 's2l2', name: 'Volume Knob',
          goal: 'The wire is fixed — the <b>knob is yours</b>. A fixed amplifier (<b>AMP ×1.2</b>) holds a steady vote for COLD. Loud enough that 🔥 Fire wins WARM, quiet enough that 🍃 Breeze stays COLD — find the <b>right</b> volume, not the loudest.',
          inputs: [{ key: 'HEAT', icon: '🔥', unit: '°', scale: 100 }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'COLD', icon: '❄️' }, { key: 'WARM', icon: '🔥' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 0 },
            { id: 'R1', type: 'amp', label: 'AMP', init: 1.2, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'R1', p: 0 }, locked: true },
            { from: { n: 'R1', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Fire', icon: '🔥', f: [1.0, 1], label: 1 },
            { name: 'Breeze', icon: '🍃', f: [0.45, 1], label: 0 }
          ],
          stars: { s2: 0.55, s3: 0.59 },
          tip: 'Past ~2.7 the Breeze flips WARM — back off and find the sweet spot.'
        },
        {
          id: 's2l3', name: 'Whisper',
          goal: 'A tiny ✨ Spark whispers at signal 0.3 — amplify it past the fixed noise floor (<b>AMP ×0.55</b>). But careful: <b>gain lifts everything</b>, sensor 〰️ Noise included.',
          inputs: [{ key: 'HEAT', icon: '🔥', unit: '°', scale: 100 }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'COLD', icon: '❄️' }, { key: 'WARM', icon: '🔥' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 0 },
            { id: 'R1', type: 'amp', label: 'AMP', init: 0.55, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'R1', p: 0 }, locked: true },
            { from: { n: 'R1', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Spark', icon: '✨', f: [0.3, 1], label: 1 },
            { name: 'Noise', icon: '〰️', f: [0.15, 1], label: 0 }
          ],
          stars: { s2: 0.52, s3: 0.54 },
          tip: 'Max volume still works — but the surest verdict lives lower. Louder isn’t clearer.'
        },
        {
          id: 's2l4', name: 'Below Zero',
          goal: 'This thermometer reads <b>−40° to +40°</b> (signal −1 to +1). One knob must satisfy BOTH cards — feel what a negative signal does.',
          inputs: [{ key: 'THERMO', icon: '🌡️', range: [-1, 1], unit: '°', scale: 40 }],
          outputs: [{ key: 'COLD', icon: '❄️' }, { key: 'WARM', icon: '🔥' }],
          comps: [{ id: 'A1', type: 'amp', label: 'A1', init: 0 }],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 1 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Fire', icon: '🔥', f: [1.0], label: 1 },
            { name: 'Deep Freeze', icon: '🥶', f: [-0.8], label: 0 }
          ],
          stars: { s2: 0.85, s3: 0.91 },
          tip: 'A negative reading × a positive weight = a vote for COLD.'
        },
        {
          id: 's2l5', name: 'Upside Down',
          goal: 'Same thermometer — but this time the wire is <b>soldered into COLD</b> and cannot be moved. A knob turned <b>below zero</b> flips every vote: a hot reading now argues <i>against</i> COLD, a freezing one argues <i>for</i> it. Invert the amplifier so all three days land right.',
          inputs: [{ key: 'THERMO', icon: '🌡️', range: [-1, 1], unit: '°', scale: 40 }],
          outputs: [{ key: 'COLD', icon: '❄️' }, { key: 'WARM', icon: '🔥' }],
          comps: [{ id: 'A1', type: 'amp', label: 'A1', init: 1 }],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Fire', icon: '🔥', f: [1.0], label: 1 },
            { name: 'Mild Day', icon: '🌤️', f: [0.3], label: 1 },
            { name: 'Deep Freeze', icon: '🥶', f: [-0.8], label: 0 }
          ],
          stars: { s2: 0.62, s3: 0.7 },
          tip: 'Below ×0 the amp argues the other way — the further below, the louder.'
        },
        {
          id: 's2l6', name: 'Sweet & Spicy',
          goal: 'Two flavors, two amps, free wiring. <b>Balance the knobs</b> so all four snacks are judged right.',
          inputs: [{ key: 'CAPSAICIN', icon: '🌶️' }, { key: 'SUGAR', icon: '🍬' }],
          outputs: [{ key: 'MILD', icon: '🥛' }, { key: 'SPICY', icon: '🔥' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'A2', type: 'amp', label: 'A2', init: 1 }
          ],
          fixedWires: [],
          freeWiring: true,
          cards: [
            { name: 'Habanero', icon: '🌶️', f: [1.0, 0.1], label: 1 },
            { name: 'Mango', icon: '🥭', f: [0.05, 0.9], label: 0 },
            { name: 'Chocolate', icon: '🍫', f: [0.0, 0.8], label: 0 },
            { name: 'Spicy Mango', icon: '🍡', f: [0.6, 0.75], label: 1 },
            { name: 'Chili Jam', icon: '🍯', f: [0.35, 0.85], label: 0 },
            { name: 'Sugar Cube', icon: '🧊', f: [0.0, 0.3], label: 0 }
          ],
          stars: { s2: 0.57, s3: 0.59 },
          tip: 'Spicy Mango wants A1 loud; Chili Jam and Sugar Cube keep A2 honest — neither knob can rest.'
        },
        {
          id: 's2l7', name: 'The Power Rail',
          goal: 'The <b>PWR</b> rail is always on — you have seen it hold factory references. Now its knob is <b>yours</b>: set the threshold so you go out unless the clouds beat the rail.',
          inputs: [{ key: 'CLOUDS', icon: '☁️' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'GO OUT', icon: '🧺' }, { key: 'STAY IN', icon: '🏠' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'A2', type: 'amp', label: 'A2', init: 1 }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'A2', p: 0 }, locked: true },
            { from: { n: 'A2', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Clear Sky', icon: '☀️', f: [0.05, 1], label: 0 },
            { name: 'Drizzle', icon: '🌦️', f: [0.55, 1], label: 1 },
            { name: 'Storm', icon: '⛈️', f: [0.95, 1], label: 1 }
          ],
          stars: { s2: 0.6, s3: 0.67 },
          tip: 'The rail sets the bar; the clouds must clear it.'
        },
        {
          id: 's2l8', name: 'Night Shift', boss: true,
          goal: 'BOSS · A new part hits the tray: the <b>Σ junction</b> — the only place wires may merge. Sleepy only when it’s night AND there’s no coffee. ALERT needs <b>two</b> voices: merge them through Σ.',
          inputs: [
            { key: 'COFFEE', icon: '☕' },
            { key: 'NIGHT', icon: '🌙' },
            { key: 'PWR +1', icon: '⚡', constant: true }
          ],
          outputs: [{ key: 'SLEEPY', icon: '😴' }, { key: 'ALERT', icon: '⚡' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 0 },
            { id: 'A2', type: 'amp', label: 'A2', init: 0 },
            { id: 'A3', type: 'amp', label: 'A3', init: 0 },
            { id: 'S1', type: 'sum', label: 'Σ1' }
          ],
          fixedWires: [],
          freeWiring: true,
          cards: [
            { name: 'Chamomile Night', icon: '🌙', f: [0, 1, 1], label: 0 },
            { name: 'Espresso Night', icon: '☕', f: [1, 1, 1], label: 1 },
            { name: 'Fresh Morning', icon: '🌅', f: [0, 0, 1], label: 1 },
            { name: 'Espresso Morning', icon: '🌞', f: [1, 0, 1], label: 1 }
          ],
          stars: { s2: 0.6, s3: 0.7 },
          tip: 'COFFEE and the rail both feed Σ → ALERT. NIGHT argues alone for SLEEPY.'
        }
      ]
    },

    {
      key: 'S3',
      num: 3,
      title: 'Bias & ReLU',
      tagline: 'the gate decides what passes',
      part: 'GTE-01',
      datasheet: {
        lead: 'Wires that meet <b>add up</b> — that is a <b>Σ junction</b>. ' +
              'A <b>GATE</b> chip is a junction with attitude: it sums, adds a ' +
              '<b>bias</b> (a head start or a handicap), then <b>clips everything ' +
              'below zero</b> (engineers call that ReLU). The bias is the power-rail ' +
              'threshold you tuned last sector, moved <b>inside</b> the part — so from ' +
              'now on the rail is a fixed <b>REF</b> and the gate holds the bar. ' +
              'Junction + bias + clip is how networks build thresholds, AND-gates, ' +
              'OR-gates… and soon, neurons.',
        symbol: 'gate',
        specs: [['BIAS RANGE', '−3.0 … +3.0'], ['LEVELS IN SECTOR', '6'], ['MAX STARS', '18 ★']]
      },
      levels: [
        {
          id: 's3l1', name: 'The Junction',
          goal: 'Wind alone is fine. Rain alone is fine. <b>Together</b> they make a storm. Wire both sensors into the <b>Σ junction</b> — it simply adds — and tune the calm rail to sit between them.',
          inputs: [{ key: 'WIND', icon: '💨' }, { key: 'RAIN', icon: '🌧️' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'CALM', icon: '✅' }, { key: 'STORM', icon: '🌩️' }],
          comps: [
            { id: 'S1', type: 'sum', label: 'Σ1' },
            { id: 'A1', type: 'amp', label: 'A1', init: 0 }
          ],
          fixedWires: [],
          freeWiring: true,
          cards: [
            { name: 'Clear Sky', icon: '☀️', f: [0.1, 0.1, 1], label: 0 },
            { name: 'Windy Day', icon: '💨', f: [0.9, 0.1, 1], label: 0 },
            { name: 'Rain Shower', icon: '🌧️', f: [0.1, 0.9, 1], label: 0 },
            { name: 'Full Storm', icon: '🌩️', f: [0.9, 0.9, 1], label: 1 }
          ],
          stars: { s2: 0.55, s3: 0.59 },
          tip: 'Σ has no knob — it just adds. The only knob is the calm rail.'
        },
        {
          id: 's3l2', name: 'Smoke Test',
          goal: 'Sound the <b>ALARM</b> only for real fires. The QUIET reference is <b>fixed at ×1</b> — the only bar you own is the <b>gate bias</b>. Amplify the smoke, then set the bias so toast and candles die at the gate.',
          inputs: [{ key: 'SMOKE', icon: '💨' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'QUIET', icon: '🔕' }, { key: 'ALARM', icon: '🚨' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'G1', type: 'relu', label: 'G1', init: 0 },
            { id: 'A2', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'G1', p: 0 }, locked: true },
            { from: { n: 'G1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'A2', p: 0 }, locked: true },
            { from: { n: 'A2', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Toast', icon: '🍞', f: [0.2, 1], label: 0 },
            { name: 'Candle', icon: '🕯️', f: [0.35, 1], label: 0 },
            { name: 'Stove Fire', icon: '🔥', f: [0.8, 1], label: 1 },
            { name: 'Blaze', icon: '🚒', f: [0.95, 1], label: 1 }
          ],
          stars: { s2: 0.6, s3: 0.65 },
          tip: 'Negative bias = a higher bar to clear.'
        },
        {
          id: 's3l3', name: 'Clipped Cold',
          goal: 'The thermometer goes <b>below zero</b> — but the gate clips negatives to 0: a gated WARM can go silent, never negative. Let the fixed reference speak for COLD, and use the bias to lift the mild days over it.',
          inputs: [{ key: 'THERMO', icon: '🌡️', range: [-1, 1], unit: '°', scale: 40 }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'COLD', icon: '❄️' }, { key: 'WARM', icon: '🔥' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'G1', type: 'relu', label: 'G1', init: 0 },
            { id: 'A2', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'G1', p: 0 }, locked: true },
            { from: { n: 'G1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'A2', p: 0 }, locked: true },
            { from: { n: 'A2', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Fire', icon: '🔥', f: [1, 1], label: 1 },
            { name: 'Mild Day', icon: '🌤️', f: [0.4, 1], label: 1 },
            { name: 'Chill', icon: '🍃', f: [-0.2, 1], label: 0 },
            { name: 'Deep Freeze', icon: '🥶', f: [-0.9, 1], label: 0 }
          ],
          stars: { s2: 0.6, s3: 0.68 },
          tip: 'Clipped WARM scores 0 — the rail wins COLD by default.'
        },
        {
          id: 's3l4', name: 'The AND Gate',
          goal: 'Sprinkle only when it is hot <b>AND</b> dry. Build it yourself: a gate sums like Σ, so <b>both amps feed one gate</b>, and the gate drives SPRINKLE. Then set the bar so a single ingredient is never enough.',
          inputs: [{ key: 'HEAT', icon: '🔥', unit: '°', scale: 100 }, { key: 'DRYNESS', icon: '🌵' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'SAFE', icon: '✅' }, { key: 'SPRINKLE', icon: '💦' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'A2', type: 'amp', label: 'A2', init: 1 },
            { id: 'G1', type: 'relu', label: 'G1', init: 0 },
            { id: 'A3', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 2 }, to: { n: 'A3', p: 0 }, locked: true },
            { from: { n: 'A3', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: true,
          cards: [
            { name: 'Hot & Dry', icon: '🏜️', f: [0.9, 0.9, 1], label: 1 },
            { name: 'Hot & Humid', icon: '🌴', f: [0.9, 0.15, 1], label: 0 },
            { name: 'Cool & Dry', icon: '🍂', f: [0.15, 0.9, 1], label: 0 },
            { name: 'Cool & Humid', icon: '🌧️', f: [0.2, 0.2, 1], label: 0 }
          ],
          stars: { s2: 0.62, s3: 0.68 },
          tip: 'Both amps loud, then bias low enough that one hot OR one dry can’t clear it alone.'
        },
        {
          id: 's3l5', name: 'The OR Gate',
          goal: 'Porch light ON if the door opens <b>OR</b> motion is seen. The board arrives wired exactly as you built the AND gate — same chip, <b>different bar</b>.',
          inputs: [{ key: 'DOOR', icon: '🚪' }, { key: 'MOTION', icon: '🏃' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'OFF', icon: '🌑' }, { key: 'LIGHT ON', icon: '💡' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'A2', type: 'amp', label: 'A2', init: 1 },
            { id: 'G1', type: 'relu', label: 'G1', init: 0 },
            { id: 'A3', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'G1', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'A2', p: 0 }, locked: true },
            { from: { n: 'A2', p: 0 }, to: { n: 'G1', p: 1 }, locked: true },
            { from: { n: 'G1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 2 }, to: { n: 'A3', p: 0 }, locked: true },
            { from: { n: 'A3', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Quiet Night', icon: '🌑', f: [0, 0.05, 1], label: 0 },
            { name: 'Door Opens', icon: '🚪', f: [0.9, 0.1, 1], label: 1 },
            { name: 'Cat Walks By', icon: '🐈', f: [0.05, 0.85, 1], label: 1 },
            { name: 'Guests Arrive', icon: '🎉', f: [0.9, 0.9, 1], label: 1 }
          ],
          stars: { s2: 0.62, s3: 0.72 },
          tip: 'An OR gate is an AND gate with a lower bar — just under zero clips the quiet night to silence.'
        },
        {
          id: 's3l6', name: 'Comfort Zone', boss: true,
          goal: 'BOSS · Cozy only in the <b>middle</b> temperatures. One gate can’t do it: a gate only ever fires <i>more</i> as its input rises. So use two — a <b>too-cold</b> gate and a <b>too-hot</b> gate — summed at Σ into UNCOMFY. Remember which way an amp must turn to fire when the reading is <i>low</i>.',
          inputs: [{ key: 'TEMP', icon: '🌡️', unit: '°', scale: 40 }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'COZY', icon: '😌' }, { key: 'UNCOMFY', icon: '🥵' }],
          comps: [
            { id: 'A1', type: 'amp', label: 'A1', init: 1 },
            { id: 'G1', type: 'relu', label: 'G1', init: 0 },
            { id: 'A2', type: 'amp', label: 'A2', init: 1 },
            { id: 'G2', type: 'relu', label: 'G2', init: 0 },
            { id: 'S1', type: 'sum', label: 'Σ1' },
            { id: 'A3', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'G1', p: 0 }, locked: true },
            { from: { n: 'G1', p: 0 }, to: { n: 'S1', p: 0 }, locked: true },
            { from: { n: 'in', p: 0 }, to: { n: 'A2', p: 0 }, locked: true },
            { from: { n: 'A2', p: 0 }, to: { n: 'G2', p: 0 }, locked: true },
            { from: { n: 'G2', p: 0 }, to: { n: 'S1', p: 0 }, locked: true },
            { from: { n: 'S1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'A3', p: 0 }, locked: true },
            { from: { n: 'A3', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          cards: [
            { name: 'Freezing', icon: '🥶', f: [0.05, 1], label: 1 },
            { name: 'Just Right', icon: '😌', f: [0.48, 1], label: 0 },
            { name: 'Comfy Eve', icon: '🛋️', f: [0.52, 1], label: 0 },
            { name: 'Scorching', icon: '🥵', f: [0.95, 1], label: 1 }
          ],
          stars: { s2: 0.55, s3: 0.6 },
          tip: 'A1 below zero so G1 catches cold; A2 above zero so G2 catches heat. Biases set the two edges of the band.'
        }
      ]
    },

    {
      key: 'S4',
      num: 4,
      title: 'The Neuron',
      tagline: 'amps + gate in one chip — and it learns',
      part: 'NRN-01',
      datasheet: {
        lead: 'The amps-plus-gate assembly you built by hand has a name: a ' +
              '<b>neuron</b> (w·x + b, clipped). This chip tunes its <b>own knobs</b>: show it labeled ' +
              'cards, press TRAIN, and <b>gradient descent</b> nudges every weight ' +
              'to shrink the error. One <b>epoch</b> = one pass over every card; ' +
              '<b>loss</b> = how wrong the chip still is, summed over the deck — training ' +
              'drives it down. Your new job: coach the training — pick the ' +
              '<b>learning rate</b>, know when to reset. Fewer epochs, more stars.',
        symbol: 'neuron',
        specs: [['TRAINING', 'GRADIENT DESCENT'], ['LEVELS IN SECTOR', '5'], ['MAX STARS', '15 ★']]
      },
      levels: [
        {
          id: 's4l1', name: 'It Learns!', mode: 'train',
          goal: 'Your sprinkler board is back — the two amps and the gate fused into one chip, <b>U1</b>. It ships tuned as the <b>OR</b> gate (bias at zero). Press <b>TRAIN</b> and watch the LEDs move: the chip finds the AND bar on its own.',
          inputs: [{ key: 'HEAT', icon: '🔥', unit: '°', scale: 100 }, { key: 'DRYNESS', icon: '🌵' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'SAFE', icon: '✅' }, { key: 'SPRINKLE', icon: '💦' }],
          comps: [
            { id: 'U1', type: 'neuron', label: 'U1', nw: 2, init: { w: [2.8, 3.0], b: 0 } },
            { id: 'A1', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'U1', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U1', p: 1 }, locked: true },
            { from: { n: 'U1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 2 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          lr: { init: 0.1, locked: true },
          pars: { p2: 40, p3: 15 },
          cards: [
            { name: 'Hot & Dry', icon: '🏜️', f: [0.9, 0.9, 1], label: 1 },
            { name: 'Hot & Humid', icon: '🌴', f: [0.9, 0.15, 1], label: 0 },
            { name: 'Cool & Dry', icon: '🍂', f: [0.15, 0.9, 1], label: 0 },
            { name: 'Cool & Humid', icon: '🌧️', f: [0.2, 0.2, 1], label: 0 }
          ],
          tip: 'Just press TRAIN — watch the b LED sink below zero, exactly the bar you set by hand.'
        },
        {
          id: 's4l2', name: 'The Throttle', mode: 'train',
          goal: 'A fresh board, and now <b>you</b> set the learning rate — it starts at a crawl. Bigger steps learn faster… up to a point. Beat the par!',
          inputs: [{ key: 'CLOUDS', icon: '☁️' }, { key: 'HUMID', icon: '💧' }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'DRY', icon: '🌵' }, { key: 'RAIN', icon: '🌧️' }],
          comps: [
            { id: 'U1', type: 'neuron', label: 'U1', nw: 2, init: { w: [-0.2, -0.2], b: 0.6 } },
            { id: 'A1', type: 'amp', label: 'REF', init: 1, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'U1', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U1', p: 1 }, locked: true },
            { from: { n: 'U1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 2 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          lr: { init: 0.02, locked: false },
          pars: { p2: 40, p3: 12 },
          cards: [
            { name: 'Clear', icon: '☀️', f: [0.05, 0.15, 1], label: 0 },
            { name: 'Breezy', icon: '🍃', f: [0.25, 0.3, 1], label: 0 },
            { name: 'Haze', icon: '🌫️', f: [0.35, 0.55, 1], label: 0 },
            { name: 'Grey Sky', icon: '🌥️', f: [0.7, 0.55, 1], label: 1 },
            { name: 'Overcast', icon: '☁️', f: [0.85, 0.7, 1], label: 1 },
            { name: 'Storm', icon: '⛈️', f: [0.95, 0.9, 1], label: 1 }
          ],
          tip: 'Too slow crawls, too hot never settles — the ★★★ window is in the middle (try 0.05–0.3).'
        },
        {
          id: 's4l3', name: 'Meltdown', mode: 'train',
          goal: 'These sensors are <b>loud</b> (big numbers, never normalized). Loud inputs make every training step bigger, so a hot learning rate will overshoot and thrash — find the sweet spot. (This is why real networks normalize first — remember Fair Race.)',
          inputs: [{ key: 'GEIGER', icon: '📟', unit: ' cps', scale: 100 }, { key: 'HEAT', icon: '🌡️', unit: '°', scale: 100 }, { key: 'PWR +1', icon: '⚡', constant: true }],
          outputs: [{ key: 'STABLE', icon: '✅' }, { key: 'EVACUATE', icon: '🚨' }],
          comps: [
            { id: 'U1', type: 'neuron', label: 'U1', nw: 2, init: { w: [2.5, 2.5], b: 1.0 } },
            { id: 'A1', type: 'amp', label: 'REF', init: 2, frozen: true }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'U1', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U1', p: 1 }, locked: true },
            { from: { n: 'U1', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 2 }, to: { n: 'A1', p: 0 }, locked: true },
            { from: { n: 'A1', p: 0 }, to: { n: 'out', p: 0 }, locked: true }
          ],
          freeWiring: false,
          lr: { init: 0.2, locked: false },
          pars: { p2: 15, p3: 3 },
          cards: [
            { name: 'Quiet Core', icon: '🧊', f: [0.3, 0.5, 1], label: 0 },
            { name: 'Routine Day', icon: '📋', f: [0.8, 0.9, 1], label: 0 },
            { name: 'Hot Spike', icon: '📈', f: [2.2, 1.8, 1], label: 1 },
            { name: 'Red Alert', icon: '🚨', f: [2.8, 2.4, 1], label: 1 }
          ],
          tip: 'There’s a cliff at full throttle — ride close, don’t go over.'
        },
        {
          id: 's4l4', name: 'Three Bins', mode: 'train',
          goal: 'Three chips, three bins — each neuron champions one fruit bin. Train them all at once and watch them <b>specialize</b>. The throttle starts low: pick your own pace for the par.',
          inputs: [{ key: 'SWEET', icon: '🍬' }, { key: 'SIZE', icon: '📏' }],
          outputs: [{ key: 'BERRY', icon: '🫐' }, { key: 'CITRUS', icon: '🍋' }, { key: 'MELON', icon: '🍉' }],
          comps: [
            { id: 'U1', type: 'neuron', label: 'U1', nw: 2, init: { w: [0.3, -0.2], b: 1 } },
            { id: 'U2', type: 'neuron', label: 'U2', nw: 2, init: { w: [-0.2, 0.3], b: 1 } },
            { id: 'U3', type: 'neuron', label: 'U3', nw: 2, init: { w: [0.2, 0.2], b: 1 } }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'U1', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U1', p: 1 }, locked: true },
            { from: { n: 'U1', p: 0 }, to: { n: 'out', p: 0 }, locked: true },
            { from: { n: 'in', p: 0 }, to: { n: 'U2', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U2', p: 1 }, locked: true },
            { from: { n: 'U2', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 0 }, to: { n: 'U3', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U3', p: 1 }, locked: true },
            { from: { n: 'U3', p: 0 }, to: { n: 'out', p: 2 }, locked: true }
          ],
          freeWiring: false,
          lr: { init: 0.1, locked: false },
          pars: { p2: 60, p3: 15 },
          cards: [
            { name: 'Blueberry', icon: '🫐', f: [0.4, 0.05], label: 0 },
            { name: 'Strawberry', icon: '🍓', f: [0.5, 0.2], label: 0 },
            { name: 'Lemon', icon: '🍋', f: [0.1, 0.35], label: 1 },
            { name: 'Grapefruit', icon: '🍊', f: [0.3, 0.55], label: 1 },
            { name: 'Melon', icon: '🍈', f: [0.7, 0.85], label: 2 },
            { name: 'Watermelon', icon: '🍉', f: [0.65, 1.0], label: 2 }
          ],
          tip: 'Watch the LED bars — each chip specializes.'
        },
        {
          id: 's4l5', name: 'Chip Factory', mode: 'train', boss: true,
          goal: 'BOSS · Same three bins, trickier fruit — Kiwi and Orange sit right on the berry/citrus line. The factory throttle is <b>wide open</b>; on close data that thrashes. Find the pace that ships boards fast: tight epoch budget for ★★★.',
          inputs: [{ key: 'SWEET', icon: '🍬' }, { key: 'SIZE', icon: '📏' }],
          outputs: [{ key: 'BERRY', icon: '🫐' }, { key: 'CITRUS', icon: '🍋' }, { key: 'MELON', icon: '🍉' }],
          comps: [
            { id: 'U1', type: 'neuron', label: 'U1', nw: 2, init: { w: [0.3, -0.2], b: 1 } },
            { id: 'U2', type: 'neuron', label: 'U2', nw: 2, init: { w: [-0.2, 0.3], b: 1 } },
            { id: 'U3', type: 'neuron', label: 'U3', nw: 2, init: { w: [0.2, 0.2], b: 1 } }
          ],
          fixedWires: [
            { from: { n: 'in', p: 0 }, to: { n: 'U1', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U1', p: 1 }, locked: true },
            { from: { n: 'U1', p: 0 }, to: { n: 'out', p: 0 }, locked: true },
            { from: { n: 'in', p: 0 }, to: { n: 'U2', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U2', p: 1 }, locked: true },
            { from: { n: 'U2', p: 0 }, to: { n: 'out', p: 1 }, locked: true },
            { from: { n: 'in', p: 0 }, to: { n: 'U3', p: 0 }, locked: true },
            { from: { n: 'in', p: 1 }, to: { n: 'U3', p: 1 }, locked: true },
            { from: { n: 'U3', p: 0 }, to: { n: 'out', p: 2 }, locked: true }
          ],
          freeWiring: false,
          lr: { init: 1.0, locked: false },
          pars: { p2: 80, p3: 20 },
          cards: [
            { name: 'Blueberry', icon: '🫐', f: [0.4, 0.05], label: 0 },
            { name: 'Strawberry', icon: '🍓', f: [0.5, 0.2], label: 0 },
            { name: 'Kiwi', icon: '🥝', f: [0.45, 0.28], label: 0 },
            { name: 'Lemon', icon: '🍋', f: [0.1, 0.35], label: 1 },
            { name: 'Orange', icon: '🍊', f: [0.5, 0.42], label: 1 },
            { name: 'Grapefruit', icon: '🍅', f: [0.3, 0.55], label: 1 },
            { name: 'Melon', icon: '🍈', f: [0.7, 0.85], label: 2 },
            { name: 'Watermelon', icon: '🍉', f: [0.65, 1.0], label: 2 }
          ],
          tip: 'A mid throttle beats a wild one on tricky data.'
        }
      ]
    }
  ];

  root.NQLevels = { CHAPTERS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
