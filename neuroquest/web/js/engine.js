/* NeuroQuest engine — forward pass, evaluation, and training.
   Ported from the verified Neural Blueprint lab engine (same math). */
(function (root) {
  'use strict';

  const CLAMP = 3;
  const clamp = v => Math.max(-CLAMP, Math.min(CLAMP, v));

  // state: { wires: [{from:{n,p}, to:{n,p}}], weights: { knobKey: value } }
  // knob keys: amp -> compId ; relu(gate) -> compId (its bias)
  //            neuron -> compId.w0..wN (per in-port) and compId.b
  function forward(level, state, features) {
    const val = {};
    features.forEach((f, i) => { val['in:' + i] = f; });
    level.comps.forEach(c => { val[c.id + ':0'] = 0; });

    // Evaluate parts in dependency order of the current wiring (one pass,
    // any depth). Parts that can't be ordered — those in a cycle and anything
    // fed only through one — go last, reading 0 from any not-yet-computed input.
    const order = [];
    const indeg = Object.create(null);
    level.comps.forEach(c => { indeg[c.id] = 0; });
    state.wires.forEach(w => {
      if (w.to.n in indeg && w.from.n in indeg) indeg[w.to.n]++;
    });
    const ready = level.comps.filter(c => indeg[c.id] === 0);
    while (ready.length) {
      const c = ready.shift();
      order.push(c);
      state.wires.forEach(w => {
        if (w.from.n === c.id && w.to.n in indeg && --indeg[w.to.n] === 0) {
          ready.push(level.comps.find(k => k.id === w.to.n));
        }
      });
    }
    level.comps.forEach(c => { if (order.indexOf(c) < 0) order.push(c); });
    order.forEach(c => {
      const inWires = state.wires.filter(w => w.to.n === c.id);
      if (c.type === 'amp') {
        const w0 = inWires.find(w => w.to.p === 0);
        const x = w0 ? (val[w0.from.n + ':' + w0.from.p] || 0) : 0;
        val[c.id + ':0'] = x * (state.weights[c.id] !== undefined ? state.weights[c.id] : 1);
      } else if (c.type === 'norm') { // NORMALIZER: (x − zero) / span
        const w0 = inWires.find(w => w.to.p === 0);
        const x = w0 ? (val[w0.from.n + ':' + w0.from.p] || 0) : 0;
        const zero = state.weights[c.id + '.zero'] || 0;
        const span = Math.max(1e-6, Math.abs(state.weights[c.id + '.span'] || 1));
        val[c.id + ':0'] = (x - zero) / span;
      } else if (c.type === 'sum') { // Σ junction: adds its inputs, nothing else
        let s = 0;
        inWires.forEach(w => { s += val[w.from.n + ':' + w.from.p] || 0; });
        val[c.id + ':0'] = s;
      } else if (c.type === 'relu') { // GATE: sum + bias, clipped at zero
        let s = (state.weights[c.id] || 0);
        inWires.forEach(w => { s += val[w.from.n + ':' + w.from.p] || 0; });
        val[c.id + ':0'] = Math.max(0, s);
      } else if (c.type === 'neuron') { // per-port weights + bias + ReLU
        let s = (state.weights[c.id + '.b'] || 0);
        inWires.forEach(w => {
          const x = val[w.from.n + ':' + w.from.p] || 0;
          s += (state.weights[c.id + '.w' + w.to.p] !== undefined
            ? state.weights[c.id + '.w' + w.to.p] : 1) * x;
        });
        val[c.id + ':0'] = Math.max(0, s);
      }
    });

    const scores = level.outputs.map((_, p) => {
      let s = 0;
      state.wires.filter(w => w.to.n === 'out' && w.to.p === p)
        .forEach(w => { s += val[w.from.n + ':' + w.from.p] || 0; });
      return s;
    });

    const m = Math.max.apply(null, scores);
    const ex = scores.map(s => Math.exp(s - m));
    const Z = ex.reduce((a, b) => a + b, 0);
    const softmax = ex.map(e => e / Z);

    return { val, scores, softmax };
  }

  // true when a signal leaving part `a` can reach part `b` along `wires`
  // (a === b counts) — wiring b → a would then close a loop
  function feedsInto(wires, a, b) {
    const seen = new Set([a]);
    const stack = [a];
    while (stack.length) {
      const n = stack.pop();
      if (n === b) return true;
      wires.forEach(w => {
        if (w.from.n === n && !seen.has(w.to.n)) { seen.add(w.to.n); stack.push(w.to.n); }
      });
    }
    return false;
  }

  function argmax(a) {
    let i = 0;
    a.forEach((v, j) => { if (v > a[i]) i = j; });
    return i;
  }

  /* The decision a forward pass makes: the index of the single strictly
     highest output, or -1 when the top is tied (e.g. a dead circuit where
     every score is 0). A tie never counts as a correct answer. */
  function predict(fw) {
    const top = argmax(fw.scores);
    const tied = fw.scores.some((s, j) => j !== top && s === fw.scores[top]);
    return tied ? -1 : top;
  }

  function evaluate(level, state) {
    let allCorrect = true;
    let minConf = 1;
    let totalLoss = 0;
    const perCard = level.cards.map(card => {
      const fw = forward(level, state, card.f);
      const pred = predict(fw);
      const ok = pred === card.label;
      if (!ok) allCorrect = false;
      const conf = fw.softmax[card.label];
      if (conf < minConf) minConf = conf;
      totalLoss += -Math.log(Math.max(conf, 1e-9));
      return { card, fw, pred, ok, conf };
    });
    const avgLoss = totalLoss / level.cards.length;
    let stars = 0;
    if (allCorrect) {
      stars = 1;
      if (level.stars) {
        if (minConf >= level.stars.s2) stars = 2;
        if (minConf >= level.stars.s3) stars = 3;
      }
    }
    return { perCard, allCorrect, minConf, avgLoss, stars };
  }

  /* One training epoch: SGD over shuffled cards, softmax cross-entropy.
     Only 'neuron' comps train (their wires must run straight to out ports —
     true for all Sector 4 boards). rnd allows deterministic verification. */
  function trainEpoch(level, state, lr, rnd) {
    const R = rnd || Math.random;
    const order = level.cards.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach(idx => {
      const card = level.cards[idx];
      const fw = forward(level, state, card.f);
      const g = fw.softmax.map((s, p) => s - (p === card.label ? 1 : 0));

      level.comps.forEach(c => {
        if (c.type !== 'neuron' || c.frozen) return;
        let og = 0;
        state.wires.forEach(w => {
          if (w.from.n === c.id && w.to.n === 'out') og += g[w.to.p];
        });
        if (!og) return;
        const inWires = state.wires.filter(w => w.to.n === c.id);
        let pre = state.weights[c.id + '.b'] || 0;
        inWires.forEach(w => {
          const x = fw.val[w.from.n + ':' + w.from.p] || 0;
          pre += (state.weights[c.id + '.w' + w.to.p] || 0) * x;
        });
        const d = og * (pre > 0 ? 1 : 0);
        if (!d) return;
        inWires.forEach(w => {
          const x = fw.val[w.from.n + ':' + w.from.p] || 0;
          const k = c.id + '.w' + w.to.p;
          state.weights[k] = clamp((state.weights[k] || 0) - lr * d * x);
        });
        state.weights[c.id + '.b'] = clamp((state.weights[c.id + '.b'] || 0) - lr * d);
      });
    });
  }

  root.NQEngine = { forward, evaluate, trainEpoch, argmax, predict, clamp, feedsInto };
})(typeof globalThis !== 'undefined' ? globalThis : window);
