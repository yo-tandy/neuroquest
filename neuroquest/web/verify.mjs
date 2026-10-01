// NeuroQuest level verifier — proves every level is solvable and every
// star threshold / epoch par is achievable. Run: node verify.mjs
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
eval(readFileSync(join(dir, 'js/engine.js'), 'utf8'));
eval(readFileSync(join(dir, 'js/levels.js'), 'utf8'));

const { CHAPTERS } = globalThis.NQLevels;
const E = globalThis.NQEngine;

function w(fn, fp, tn, tp) { return { from: { n: fn, p: fp }, to: { n: tn, p: tp } }; }

// Intended optimal wiring for free-wiring levels
const INTENDED = {
  's1l1': [w('in', 0, 'out', 1)],
  's1l2': [w('in', 0, 'out', 1)],
  's1l3': [w('in', 0, 'out', 1), w('in', 1, 'out', 0)],
  's1l4': [w('in', 0, 'out', 0), w('in', 1, 'out', 1), w('in', 2, 'out', 2)],
  's2l1': [w('in', 0, 'N1', 0), w('N1', 0, 'out', 1)],
  's2l6': [w('in', 0, 'A1', 0), w('A1', 0, 'out', 1), w('in', 1, 'A2', 0), w('A2', 0, 'out', 0)],
  's2l8': [w('in', 1, 'A1', 0), w('A1', 0, 'out', 0),
            w('in', 0, 'A2', 0), w('A2', 0, 'S1', 0),
            w('in', 2, 'A3', 0), w('A3', 0, 'S1', 0),
            w('S1', 0, 'out', 1)],
  's3l1': [w('in', 0, 'S1', 0), w('in', 1, 'S1', 0), w('S1', 0, 'out', 1),
            w('in', 2, 'A1', 0), w('A1', 0, 'out', 0)],
  's3l4': [w('in', 0, 'A1', 0), w('A1', 0, 'G1', 0),
            w('in', 1, 'A2', 0), w('A2', 0, 'G1', 0),
            w('G1', 0, 'out', 1)]
};

// Lessons that must be UNSKIPPABLE: a cheaper circuit than the intended one
// (a part left out) must not reach ★★ on these boards.
const SHORTCUTS = {
  's3l1': { why: 'Σ skipped — WIND wired straight to STORM',
            wires: [w('in', 0, 'out', 1), w('in', 2, 'A1', 0), w('A1', 0, 'out', 0)] },
  's3l4': { why: 'amps skipped — sensors wired straight into the gate',
            wires: [w('in', 0, 'G1', 0), w('in', 1, 'G1', 0), w('G1', 0, 'out', 1)] }
};
// Knob lessons that must be UNSKIPPABLE: with these knobs left untouched, the
// best the remaining knobs can do must stay below ★★.
const PINNED = {
  's3l2': { why: 'bias untouched', keys: ['G1'] },
  's3l4': { why: 'bias untouched', keys: ['G1'] },
  's2l6': { why: 'A2 untouched', keys: ['A2'] }
};

function mkRnd(seed) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baseWeights(lv) {
  const weights = {};
  lv.comps.forEach(c => {
    if (c.type === 'neuron') {
      c.init.w.forEach((v, i) => { weights[c.id + '.w' + i] = v; });
      weights[c.id + '.b'] = c.init.b;
    } else if (c.type === 'norm') {
      Object.entries(c.params).forEach(([p, spec]) => { weights[c.id + '.' + p] = spec.init; });
    } else {
      weights[c.id] = c.init !== undefined ? c.init : 1;
    }
  });
  return weights;
}

/* ---- hand-tune levels: grid search over knob space ---- */
function gridSearch(level, wires, pinned) {
  // knob specs: amps/gates are ±3 dials; normalizers expose zero/span params
  const knobs = [];
  level.comps.forEach(c => {
    if (c.frozen || (pinned && pinned.includes(c.id))) return;
    if (c.type === 'amp' || c.type === 'relu') knobs.push({ key: c.id, min: -3, max: 3 });
    else if (c.type === 'norm') {
      Object.entries(c.params).forEach(([p, spec]) =>
        knobs.push({ key: c.id + '.' + p, min: spec.min, max: spec.max, step: spec.step }));
    }
  });
  const frozen = baseWeights(level);
  const stepDflt = knobs.length <= 2 ? 0.05 : knobs.length === 3 ? 0.1
             : knobs.length === 4 ? 0.2 : 0.5;
  const valsFor = k => {
    const st = k.step || stepDflt;
    const out = [];
    for (let v = k.min; v <= k.max + 1e-9; v += st) out.push(Math.round(v * 100) / 100);
    return out;
  };
  const valSets = knobs.map(valsFor);

  const evalW = (weights) => E.evaluate(level, { wires, weights });
  let best = { minConf: -1, weights: null };
  const total = valSets.reduce((a, vs) => a * vs.length, 1);
  for (let k = 0; k < total; k++) {
    let rem = k;
    const weights = { ...frozen };
    for (let a = 0; a < knobs.length; a++) {
      weights[knobs[a].key] = valSets[a][rem % valSets[a].length];
      rem = Math.floor(rem / valSets[a].length);
    }
    const ev = evalW(weights);
    if (ev.allCorrect && ev.minConf > best.minConf) {
      best = { minConf: ev.minConf, weights: { ...weights } };
    }
  }
  // local refinement
  if (best.weights) {
    for (let round = 0; round < 40; round++) {
      let improved = false;
      for (const k of knobs) {
        const st = (k.step || stepDflt);
        for (const d of [-st, st, -st / 2, st / 2]) {
          const nv = Math.min(k.max, Math.max(k.min, best.weights[k.key] + d));
          const trial = { ...best.weights, [k.key]: nv };
          const ev = evalW(trial);
          if (ev.allCorrect && ev.minConf > best.minConf) {
            best = { minConf: ev.minConf, weights: trial };
            improved = true;
          }
        }
      }
      if (!improved) break;
    }
  }
  return best;
}

/* ---- train levels: epochs-to-solve across learning rates ---- */
function trainSearch(level) {
  const wires = level.fixedWires.map(fw => ({ from: fw.from, to: fw.to }));
  const lrs = level.lr.locked
    ? [level.lr.init]
    : [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0, 3.0];
  if (!lrs.includes(level.lr.init)) lrs.push(level.lr.init);
  const out = [];
  for (const lr of lrs) {
    // epochs = worst seed (a stalled seed makes it ∞); fastest = best seed.
    // Every seed runs so the fastest is never hidden behind a stalled one.
    let worst = 0, fastest = Infinity;
    for (let seed = 1; seed <= 12; seed++) {
      const state = { wires, weights: baseWeights(level) };
      const rnd = mkRnd(seed);
      let solved = Infinity;
      for (let ep = 1; ep <= 600; ep++) {
        E.trainEpoch(level, state, lr, rnd);
        if (E.evaluate(level, state).allCorrect) { solved = ep; break; }
      }
      worst = Math.max(worst, solved);
      fastest = Math.min(fastest, solved);
    }
    out.push({ lr, epochs: worst, fastest });
  }
  return out;
}

let fail = 0;
for (const ch of CHAPTERS) {
  console.log(`\n=== Sector ${ch.num}: ${ch.title} ===`);
  for (const lv of ch.levels) {
    if (lv.mode === 'train') {
      const res = trainSearch(lv);
      const solvable = res.filter(r => isFinite(r.epochs));
      const bestEp = Math.min(...solvable.map(r => r.epochs));
      const nearPar3 = solvable.filter(r => r.epochs <= lv.pars.p3).length;
      // an unlocked throttle must MATTER: the factory setting alone must not
      // reach ★★★ on ANY seed (mirrors the "untouched knobs" rule of
      // hand-tuned boards). In-game the shuffle is unseeded, so a single lucky
      // seed means some players get ★★★ without touching the throttle.
      const initRes = res.find(r => r.lr === lv.lr.init);
      const atInit = initRes.epochs;
      const initTooGood = !lv.lr.locked && initRes.fastest <= lv.pars.p3;
      const ok = solvable.length > 0 && bestEp <= lv.pars.p3 && nearPar3 >= 1 && !initTooGood;
      if (!ok) fail++;
      if (initTooGood) console.log(`     ^ ${lv.id} reaches ★★★ at the factory throttle on some seed (${lv.lr.init} → ${initRes.fastest} ep)`);
      console.log(`${ok ? 'OK ' : 'FAIL'} ${lv.id.padEnd(6)} ${lv.name.padEnd(15)} best=${bestEp}ep ` +
        `(★★ ≤${lv.pars.p2}, ★★★ ≤${lv.pars.p3}; init lr ${lv.lr.init} → ${isFinite(atInit) ? atInit : '∞'})  ` +
        res.map(r => `${r.lr}:${isFinite(r.epochs) ? r.epochs : '∞'}`).join(' '));
    } else {
      const wires = (INTENDED[lv.id] || []).concat(
        lv.fixedWires.filter(fw => fw.locked).map(fw => ({ from: fw.from, to: fw.to }))
      );
      const useWires = wires.length ? wires : lv.fixedWires;
      // a level must NOT be solved by its initial state (auto-test would
      // hand out a free win on entry)
      const initState = { wires: lv.fixedWires.map(w => ({ from: w.from, to: w.to })),
                          weights: baseWeights(lv) };
      const initSolved = lv.fixedWires.length > 0 && E.evaluate(lv, initState).allCorrect;
      // and a level WITH knobs must not be solved by correct wiring alone —
      // untouched init weights on the intended topology must fail at least one card
      const hasKnobs = lv.comps.some(c => !c.frozen &&
        (c.type === 'amp' || c.type === 'relu' || c.type === 'norm'));
      const wiredInitSolved = hasKnobs &&
        E.evaluate(lv, { wires: useWires, weights: baseWeights(lv) }).allCorrect;
      const best = gridSearch(lv, useWires);
      // shortcut circuits / pinned knobs must stall below ★★
      const notes = [];
      let shortcutOk = true;
      const sc = SHORTCUTS[lv.id];
      if (sc) {
        const locked = lv.fixedWires.filter(fw => fw.locked).map(fw => ({ from: fw.from, to: fw.to }));
        const r = gridSearch(lv, sc.wires.concat(locked));
        if (r.minConf >= lv.stars.s2) { shortcutOk = false; notes.push(`shortcut reaches ★★ (${sc.why}: ${r.minConf.toFixed(3)})`); }
        else notes.push(`shortcut caps at ${r.minConf.toFixed(3)} (${sc.why}) ✓`);
      }
      const pn = PINNED[lv.id];
      if (pn) {
        const r = gridSearch(lv, useWires, pn.keys);
        if (r.minConf >= lv.stars.s2) { shortcutOk = false; notes.push(`pinned knobs reach ★★ (${pn.why}: ${r.minConf.toFixed(3)})`); }
        else notes.push(`pinned caps at ${r.minConf.toFixed(3)} (${pn.why}) ✓`);
      }
      const ok = best.minConf >= lv.stars.s3 && best.minConf > 0 && !initSolved && !wiredInitSolved && shortcutOk;
      if (!ok) fail++;
      if (wiredInitSolved) console.log(`     ^ ${lv.id} solvable by wiring alone (knobs untouched)`);
      notes.forEach(n => console.log(`     ^ ${lv.id} ${n}`));
      console.log(`${ok ? 'OK ' : 'FAIL'} ${lv.id.padEnd(6)} ${lv.name.padEnd(15)} optimum minConf=${best.minConf.toFixed(4)}` +
        `  (★★ ${lv.stars.s2}, ★★★ ${lv.stars.s3})` +
        (best.weights ? `  w=${JSON.stringify(Object.fromEntries(Object.entries(best.weights).filter(([k]) => !k.includes('.'))))}` : ''));
    }
  }
}
// Engine wiring-order checks: forward() must handle any chain depth and
// settle deterministically on loops; feedsInto() is what refuses loop wires.
console.log('\n=== Engine: wiring order ===');
{
  const amps = n => Array.from({ length: n }, (_, i) => ({ id: 'L' + (i + 1), type: 'amp' }));
  const lab = comps => ({ comps, outputs: ['A', 'B'] });
  const check = (name, cond) => { if (!cond) fail++; console.log(`${cond ? 'OK ' : 'FAIL'} ${name}`); };

  // in → L6 → L5 → … → L1 → OUT A, declared in the "wrong" order
  const chain = [w('in', 0, 'L6', 0)];
  for (let i = 6; i > 1; i--) chain.push(w('L' + i, 0, 'L' + (i - 1), 0));
  chain.push(w('L1', 0, 'out', 0));
  const deep = E.forward(lab(amps(6)), { wires: chain, weights: {} }, [1]);
  check('6-deep chain reaches the output', deep.scores[0] === 1);

  // L1 ⇄ L2 loop (legacy wiring) fed from in, read at OUT A: finite and repeatable
  const loopWires = [w('in', 0, 'L1', 0), w('L1', 0, 'L2', 0), w('L2', 0, 'L1', 0), w('L2', 0, 'out', 0)];
  const l1 = E.forward(lab(amps(2)), { wires: loopWires, weights: {} }, [1]);
  const l2 = E.forward(lab(amps(2)), { wires: loopWires, weights: {} }, [1]);
  check('loop wiring gives a finite, deterministic result',
    l1.scores.every(Number.isFinite) && l1.scores.join() === l2.scores.join());

  const fw = [w('in', 0, 'L1', 0), w('L1', 0, 'L2', 0), w('L1', 0, 'L3', 0),
              w('L2', 0, 'L4', 0), w('L3', 0, 'L4', 0), w('L4', 0, 'out', 0)];
  check('feedsInto: self-loop refused', E.feedsInto(fw, 'L2', 'L2'));
  check('feedsInto: back-wire L4 → L1 closes a loop', E.feedsInto(fw, 'L1', 'L4'));
  check('feedsInto: diamond side wire L2 → L3 is allowed', !E.feedsInto(fw, 'L3', 'L2'));
  check('feedsInto: in → part and part → out are allowed',
    !E.feedsInto(fw, 'L4', 'in') && !E.feedsInto(fw, 'out', 'L1'));

  // predict(): a tie (incl. a dead circuit) is never an answer
  check('predict: strict winner', E.predict({ scores: [0.2, 1.5, -1] }) === 1);
  check('predict: tied top → -1', E.predict({ scores: [2, 2, 0] }) === -1);
  check('predict: dead circuit (all 0) → -1', E.predict({ scores: [0, 0] }) === -1);
  const dead = E.evaluate({ ...lab([]), cards: [{ f: [1], label: 0 }], stars: { s2: 0.6, s3: 0.7 } },
    { wires: [], weights: {} });
  check('evaluate: unwired circuit does not pass an OUT A card',
    !dead.allCorrect && !dead.perCard[0].ok && !dead.stars);
}

console.log(fail ? `\n${fail} LEVEL(S) FAILED` : '\nAll levels verified.');
process.exit(fail ? 1 : 0);
