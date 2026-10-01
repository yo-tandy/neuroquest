/* NeuroQuest — game shell: map, level player, wiring, knobs, training,
   stars, persistence. */
(function () {
  'use strict';
  const { CHAPTERS } = window.NQLevels;
  const E = window.NQEngine;

  const $ = sel => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html !== undefined) d.innerHTML = html;
    return d;
  };

  /* ---------- persistence ---------- */
  const store = {
    load(k, fb) { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; } },
    save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  // Canonical level ids are positional: 's2l1' = Sector 2, Level 1.
  // v1 saves used the old mnemonic ids — migrate them once.
  const OLD_IDS = {
    'sig-1': 's1l1', 'sig-2': 's1l3', 'sig-2b': 's2l1', 'sig-3': 's1l2', 'sig-4': 's1l4',
    'wgt-1': 's2l2', 'wgt-2': 's2l3', 'wgt-3': 's2l4', 'wgt-4': 's2l5', 'wgt-5': 's2l6',
    'wgt-6': 's2l7',
    'rlu-0': 's3l1', 'rlu-1': 's3l2', 'rlu-2': 's3l3', 'rlu-3': 's3l4', 'rlu-4': 's3l5',
    'rlu-5': 's3l6',
    'nrn-1': 's4l1', 'nrn-2': 's4l2', 'nrn-3': 's4l3', 'nrn-4': 's4l4', 'nrn-5': 's4l5'
  };
  // v3: Sector 2 gained a level after Below Zero (s2l5 · Upside Down), so the
  // v2 ids of the three boards behind it each moved up by one.
  const V2_TO_V3 = { 's2l5': 's2l6', 's2l6': 's2l7', 's2l7': 's2l8' };
  const PROGRESS_KEY = 'nq.progress.v3';
  let progress = store.load(PROGRESS_KEY, null);
  if (!progress) {
    let v2 = store.load('nq.progress.v2', null);
    if (!v2) {
      const old = store.load('nq.progress.v1', {});
      v2 = {};
      for (const [k, v] of Object.entries(old)) v2[OLD_IDS[k] || k] = v;
    }
    progress = {};
    for (const [k, v] of Object.entries(v2)) progress[V2_TO_V3[k] || k] = v;
    store.save(PROGRESS_KEY, progress);
  }
  let seenIntro = store.load('nq.intro.v1', {});
  // sector intro flags migrated from the old mnemonic chapter keys
  [['SIG', 'S1'], ['WGT', 'S2'], ['RLU', 'S3'], ['NRN', 'S4']].forEach(([o, n]) => {
    if (seenIntro[o]) { seenIntro[n] = true; delete seenIntro[o]; }
  });

  const flat = [];
  CHAPTERS.forEach(ch => ch.levels.forEach((lv, i) => {
    lv.code = `BRD-${lv.id.toUpperCase()}`; // derived from the level id — the only naming scheme
    flat.push({ ch, lv });
  }));

  const starsOf = id => progress[id] || 0;
  const totalStars = () => flat.reduce((a, f) => a + starsOf(f.lv.id), 0);
  const isUnlocked = idx => idx === 0 || starsOf(flat[idx - 1].lv.id) > 0;
  const levelIdx = id => flat.findIndex(f => f.lv.id === id);

  let R = null; // runtime

  // run cb on the next frame — or after 60ms if rAF is suspended
  // (hidden/backgrounded webviews stop rAF entirely)
  function nextFrame(cb) {
    let ran = false;
    const f = () => { if (!ran) { ran = true; cb(); } };
    requestAnimationFrame(f);
    setTimeout(f, 60);
  }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg, ms) {
    const t = $('#toast');
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms || 2200);
  }

  /* ================= MAP ================= */
  function renderMap() {
    $('#hud-stars').innerHTML = `<span class="star">★</span> ${totalStars()}`;
    const scroll = $('#map-scroll');
    scroll.innerHTML = '';
    let idx = 0;
    CHAPTERS.forEach(ch => {
      const chStart = idx;
      const chUnlocked = isUnlocked(chStart);
      const done = ch.levels.filter(l => starsOf(l.id) > 0).length;

      const bar = el('div', 'sector-bar' + (chUnlocked ? '' : ' locked'), `
        <div>
          <div class="sb-title">SECTOR 0${ch.num} · ${ch.title.toUpperCase()}</div>
          <div class="sb-sub">${ch.tagline}</div>
        </div>
        <div class="lcd">${done}/${ch.levels.length}</div>`);
      bar.onclick = () => { if (chUnlocked) showDatasheet(ch); };
      scroll.appendChild(bar);

      const mapDiv = el('div', 'sector-map');
      const n = ch.levels.length;
      const rowH = 96;
      mapDiv.style.height = (n * rowH + 20) + 'px';
      const xs = [];
      ch.levels.forEach((lv, i) => {
        const xPct = lv.boss ? 50 : (i % 2 === 0 ? 30 : 70);
        const y = 14 + i * rowH;
        xs.push({ xPct, y: y + 32 });
        const gIdx = idx + i;
        const st = starsOf(lv.id);
        const unlocked = isUnlocked(gIdx);
        const isCurrent = unlocked && st === 0;
        let cls = 'pad' + (lv.boss ? ' chipstyle' : '');
        if (st > 0) cls += ' done';
        else if (isCurrent) cls += ' current';
        else if (!unlocked) cls += ' locked';
        const starsHtml = st > 0
          ? `<span class="n-stars">${'★'.repeat(st)}<span style="opacity:.3">${'★'.repeat(3 - st)}</span></span>`
          : '';
        const pad = el('div', cls, `
          ${st > 0 ? '<div class="hole"></div>' : ''}
          <span class="n-num">${unlocked ? (lv.boss ? '🏆' : (i + 1)) : '🔒'}</span>
          ${starsHtml}
          ${isCurrent ? '<span class="playlbl">PLAY</span>' : ''}`);
        pad.style.left = `calc(${xPct}% - 32px)`;
        pad.style.top = y + 'px';
        if (unlocked) pad.onclick = () => openLevel(lv.id);
        mapDiv.appendChild(pad);
      });

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'traces');
      svg.setAttribute('viewBox', `0 0 100 ${n * rowH + 20}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      let d = '';
      xs.forEach((p, i) => {
        if (i === 0) { d += `M ${p.xPct} ${p.y} `; return; }
        const prev = xs[i - 1];
        const midY = (prev.y + p.y) / 2;
        d += `L ${prev.xPct} ${midY - 12} L ${p.xPct} ${midY + 12} L ${p.xPct} ${p.y} `;
      });
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', chUnlocked ? 'rgba(233,185,79,0.85)' : 'rgba(233,185,79,0.25)');
      path.setAttribute('stroke-width', '1.2');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(path);
      mapDiv.insertBefore(svg, mapDiv.firstChild);
      scroll.appendChild(mapDiv);
      idx += n;
    });
    scroll.appendChild(el('div', '', '<div style="height:30px"></div>'));
  }

  /* ================= DATASHEET ================= */
  function symbolSvg(kind) {
    if (kind === 'amp') {
      return `<svg viewBox="0 0 210 104" width="100%" height="100%">
        <path d="M14 52 L64 52" stroke="#24303F" stroke-width="2.5"/>
        <circle cx="14" cy="52" r="4" fill="none" stroke="#24303F" stroke-width="2.5"/>
        <path d="M64 20 L64 84 L128 52 Z" fill="#FFD98A" stroke="#24303F" stroke-width="2.5" stroke-linejoin="round"/>
        <text x="82" y="57" font-family="Share Tech Mono" font-size="13" fill="#24303F">×w</text>
        <path d="M128 52 L196 52" stroke="#24303F" stroke-width="2.5"/>
        <circle cx="196" cy="52" r="4" fill="#24303F"/>
        <text x="10" y="40" font-family="Share Tech Mono" font-size="9" fill="#5A6878">IN</text>
        <text x="178" y="40" font-family="Share Tech Mono" font-size="9" fill="#5A6878">OUT</text>
      </svg>`;
    }
    if (kind === 'gate') {
      return `<svg viewBox="0 0 210 104" width="100%" height="100%">
        <path d="M12 52 L58 52 M12 68 L58 68" stroke="#24303F" stroke-width="2.5"/>
        <rect x="58" y="26" width="66" height="56" rx="7" fill="#FFD98A" stroke="#24303F" stroke-width="2.5"/>
        <text x="68" y="50" font-family="Share Tech Mono" font-size="11" fill="#24303F">Σ + b</text>
        <path d="M70 72 L86 72 L102 56" stroke="#24303F" stroke-width="2.2" fill="none"/>
        <path d="M124 54 L196 54" stroke="#24303F" stroke-width="2.5"/>
        <circle cx="196" cy="54" r="4" fill="#24303F"/>
        <text x="132" y="44" font-family="Share Tech Mono" font-size="9" fill="#5A6878">max(0,·)</text>
      </svg>`;
    }
    if (kind === 'neuron') {
      return `<svg viewBox="0 0 210 104" width="100%" height="100%">
        <rect x="66" y="22" width="80" height="60" rx="6" fill="#23283B"/>
        <text x="84" y="47" font-family="Share Tech Mono" font-size="10" fill="#E9B94F">NEURON</text>
        <text x="80" y="66" font-family="Share Tech Mono" font-size="9" fill="#4AE581">w·x + b</text>
        ${[0, 1, 2].map(i => `<rect x="52" y="${30 + i * 18}" width="14" height="6" fill="#E9B94F"/>`).join('')}
        ${[0, 1, 2].map(i => `<rect x="146" y="${30 + i * 18}" width="14" height="6" fill="#E9B94F"/>`).join('')}
        <path d="M18 52 L52 52 M160 52 L196 52" stroke="#24303F" stroke-width="2.5"/>
        <circle cx="196" cy="52" r="4" fill="#24303F"/>
        <text x="10" y="42" font-family="Share Tech Mono" font-size="9" fill="#5A6878">CARDS</text>
        <text x="168" y="42" font-family="Share Tech Mono" font-size="9" fill="#5A6878">OUT</text>
      </svg>`;
    }
    return `<svg viewBox="0 0 210 104" width="100%" height="100%">
      <circle cx="20" cy="72" r="5" fill="none" stroke="#24303F" stroke-width="2.5"/>
      <path d="M25 72 L80 72 L110 46 L160 46" stroke="#24303F" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <circle cx="166" cy="46" r="7" fill="#4AE581" stroke="#24303F" stroke-width="2"/>
      <circle cx="166" cy="78" r="7" fill="#E8E0CE" stroke="#24303F" stroke-width="2"/>
      <text x="14" y="92" font-family="Share Tech Mono" font-size="9" fill="#5A6878">PIN</text>
      <text x="180" y="50" font-family="Share Tech Mono" font-size="9" fill="#5A6878">LED</text>
      <text x="106" y="38" font-family="Share Tech Mono" font-size="9" fill="#5A6878">signal</text>
    </svg>`;
  }

  function showDatasheet(ch, onClose) {
    const back = $('#modal-datasheet');
    back.innerHTML = '';
    const card = el('div', 'datasheet', `
      <div class="ds-head"><span>PART No. <b>${ch.part}</b></span><span>DATASHEET · REV A</span></div>
      <div class="ds-body">
        <div class="ds-sym">${symbolSvg(ch.datasheet.symbol)}</div>
        <h2>${ch.title}</h2>
        <p class="lead">${ch.datasheet.lead}</p>
        <table class="spec-table">
          ${ch.datasheet.specs.map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('')}
        </table>
        <button class="btn btn-red" style="width:100%">POWER ON ▶</button>
      </div>`);
    card.querySelector('.btn').onclick = () => {
      back.classList.add('hidden');
      seenIntro[ch.key] = true;
      store.save('nq.intro.v1', seenIntro);
      if (onClose) onClose();
    };
    back.appendChild(card);
    back.classList.remove('hidden');
  }

  /* ================= FREE LAB ================= */
  let labBench = null; // survives leaving/returning (session)
  let labSeq = 0;

  function makeLabLevel() {
    return {
      id: '__lab__', name: 'Free Lab', code: 'LAB-001', lab: true,
      goal: 'No cards, no stars — just electricity. Turn the <b>input dials</b>, ' +
            'grab parts from the <b>tray</b>, wire anything to anything ' +
            '(wires merge only at Σ and at a GATE). The meters read your circuit <b>live</b>.',
      inputs: [
        { key: 'IN 1', icon: '🎛️' },
        { key: 'IN 2', icon: '🎛️' },
        { key: 'IN 3', icon: '🎛️' }
      ],
      outputs: [{ key: 'OUT A', icon: '🅰️' }, { key: 'OUT B', icon: '🅱️' }],
      comps: [],
      fixedWires: [],
      freeWiring: true,
      cards: [{ name: 'Live', icon: '🎛️', f: [0.5, 0.5, 0.5], label: 0 }]
    };
  }

  function openFreeLab() {
    stopTraining();
    cancelChecks();
    const lv = makeLabLevel();
    if (labBench) {
      lv.comps = labBench.comps;
      R = { level: lv, chapter: null, wires: labBench.wires, weights: labBench.weights,
            activeCard: 0, armed: null, epoch: 0, lossHist: [], lr: 0.3, timer: null,
            cardMarks: {}, validated: new Set(), wirePaths: [] };
    } else {
      R = { level: lv, chapter: null, wires: [], weights: { 'labin.0': 0.5, 'labin.1': 0.5, 'labin.2': 0.5 },
            activeCard: 0, armed: null, epoch: 0, lossHist: [], lr: 0.3, timer: null,
            cardMarks: {}, validated: new Set(), wirePaths: [] };
    }
    $('#scr-map').classList.add('hidden');
    $('#scr-awards').classList.add('hidden');
    $('#scr-level').classList.remove('hidden');
    renderLevel();
    if (!seenIntro.LAB) { showGoalOverlay(true); seenIntro.LAB = true; store.save('nq.intro.v1', seenIntro); }
  }

  function labPartCount() { return R.level.comps.length; }

  function addLabPart(type) {
    if (!R || !R.level.lab || labPartCount() >= 6) return;
    labSeq++;
    const label = (type === 'amp' ? 'A' : type === 'relu' ? 'G' : 'Σ') + labSeq;
    const comp = { id: 'L' + labSeq, type, label };
    R.level.comps.push(comp);
    R.weights[comp.id] = type === 'amp' ? 1 : 0;
    renderLevel();
  }

  function removeLabPart(id) {
    if (!R || !R.level.lab) return;
    R.level.comps = R.level.comps.filter(c => c.id !== id);
    R.wires = R.wires.filter(w => w.from.n !== id && w.to.n !== id);
    delete R.weights[id];
    renderLevel();
  }

  /* ================= AWARDS ================= */
  const AWARDS = [
    { icon: '🔌', name: 'First Spark', desc: 'Complete your first board',
      prog: () => [flat.filter(f => starsOf(f.lv.id) > 0).length > 0 ? 1 : 0, 1] },
    { icon: '📡', name: 'Signal Chaser', desc: 'Seal every board in Sector 01', sector: 1 },
    { icon: '🎚️', name: 'Knob Whisperer', desc: 'Seal every board in Sector 02', sector: 2 },
    { icon: '🚪', name: 'Gatekeeper', desc: 'Seal every board in Sector 03', sector: 3 },
    { icon: '🧠', name: 'Chip Trainer', desc: 'Seal every board in Sector 04', sector: 4 },
    { icon: '🏆', name: 'Boss Circuit', desc: 'Beat every boss board',
      prog: () => { const b = flat.filter(f => f.lv.boss); return [b.filter(f => starsOf(f.lv.id) > 0).length, b.length]; } },
    { icon: '⭐', name: 'Star Collector', desc: 'Collect 33 stars', prog: () => [Math.min(totalStars(), 33), 33] },
    { icon: '🌟', name: 'Master Engineer', desc: '★★★ on every board', prog: () => [totalStars(), flat.length * 3] }
  ];

  function awardProgress(a) {
    if (a.prog) return a.prog();
    const ch = CHAPTERS.find(c => c.num === a.sector);
    return [ch.levels.filter(l => starsOf(l.id) > 0).length, ch.levels.length];
  }

  function renderAwards() {
    $('#aw-stars').innerHTML = `<span class="star">★</span> ${totalStars()}`;
    const list = $('#awards-list');
    list.innerHTML = '';
    AWARDS.forEach(a => {
      const [got, need] = awardProgress(a);
      const done = got >= need;
      list.appendChild(el('div', 'award' + (done ? '' : ' locked'), `
        <div class="aw-ico">${done ? a.icon : '🔒'}</div>
        <div class="aw-info">
          <div class="aw-name">${a.name}</div>
          <div class="aw-desc">${a.desc}</div>
          <div class="aw-bar"><i style="width:${Math.round(got / need * 100)}%"></i></div>
        </div>
        <span class="lcd aw-prog">${got}/${need}</span>`));
    });
  }

  function switchTab(nav) {
    stopTraining();
    cancelChecks();
    if (R && R.level.lab) labBench = { comps: R.level.comps, wires: R.wires, weights: R.weights };
    $('#scr-level').classList.add('hidden');
    $('#scr-map').classList.toggle('hidden', nav !== 'map');
    $('#scr-awards').classList.toggle('hidden', nav !== 'awards');
    if (nav === 'map') { R = null; renderMap(); }
    if (nav === 'awards') { R = null; renderAwards(); }
    if (nav === 'lab') openFreeLab();
  }

  /* ================= LEVEL ================= */
  function initWeights(lv) {
    const weights = {};
    lv.comps.forEach(c => {
      if (c.type === 'neuron') {
        c.init.w.forEach((v, i) => { weights[c.id + '.w' + i] = v; });
        weights[c.id + '.b'] = c.init.b;
      } else if (c.type === 'norm') {
        Object.entries(c.params).forEach(([p, spec]) => {
          weights[c.id + '.' + p] = spec.init;
        });
      } else {
        weights[c.id] = c.init !== undefined ? c.init : 1;
      }
    });
    return weights;
  }

  function openLevel(id) {
    stopTraining();
    cancelChecks();
    const f = flat[levelIdx(id)];
    const lv = f.lv;
    const tunable = lv.comps.filter(c => (c.type === 'amp' || c.type === 'relu') && !c.frozen);
    R = {
      level: lv, chapter: f.ch,
      wires: lv.fixedWires.map(w => ({ from: w.from, to: w.to, locked: !!w.locked })),
      weights: initWeights(lv),
      activeCard: 0,
      selKnob: tunable.length ? tunable[0].id : null,
      armed: null,
      epoch: 0,
      lossHist: [],
      lr: lv.lr ? lv.lr.init : 0.3,
      timer: null,
      cardMarks: {},
      validated: new Set(),
      wirePaths: []
    };

    $('#scr-map').classList.add('hidden');
    $('#scr-level').classList.remove('hidden');
    renderLevel();

    // sector datasheet first (new sectors), then the mission briefing
    if (!seenIntro[f.ch.key]) showDatasheet(f.ch, () => showGoalOverlay(true));
    else showGoalOverlay(true);
  }

  function backToMap() {
    stopTraining();
    cancelChecks();
    if (R && R.level.lab) labBench = { comps: R.level.comps, wires: R.wires, weights: R.weights };
    R = null;
    $('#scr-awards').classList.add('hidden');
    $('#scr-level').classList.add('hidden');
    $('#scr-map').classList.remove('hidden');
    renderMap();
  }

  // depth-based auto layout (chains stack toward the meters).
  // Free-wiring boards have no wires yet, so LAYERS come from the part's
  // role: amps & normalizers sit low, Σ / gates / neurons sit above them.
  function layoutComps(lv) {
    const depth = {};
    const roleDepth = { amp: 0, norm: 0, sum: 1, relu: 1, neuron: 1 };
    lv.comps.forEach(c => {
      depth[c.id] = lv.freeWiring ? (roleDepth[c.type] || 0) : 0;
    });
    for (let k = 0; k < 4; k++) {
      lv.comps.forEach(c => {
        lv.fixedWires.filter(w => w.to.n === c.id && w.from.n !== 'in')
          .forEach(w => { depth[c.id] = Math.max(depth[c.id], (depth[w.from.n] || 0) + 1); });
      });
    }
    const maxD = Math.max(0, ...lv.comps.map(c => depth[c.id]));
    const rows = {};
    lv.comps.forEach(c => { (rows[depth[c.id]] = rows[depth[c.id]] || []).push(c); });
    const pos = {};
    Object.entries(rows).forEach(([d, comps]) => {
      // two rows sit at 66/40; three or more spread over the whole board
      const y = maxD === 0 ? 52 : maxD === 1 ? 66 - d * 26 : 70 - (d / maxD) * 40;
      comps.forEach((c, i) => {
        const x = comps.length === 1 ? 50 : 17 + (66 / (comps.length - 1)) * i;
        pos[c.id] = { x, y };
      });
    });
    return pos;
  }

  function renderLevel() {
    const lv = R.level;
    const isLab = !!lv.lab;
    $('#lv-title').textContent = lv.name;
    if (isLab) $('#lv-stars').innerHTML = '<span class="star">🔬</span>';
    else renderBestStars();
    $('#lv-goal').innerHTML = isLab
      ? `<span class="g-tag">◎ SANDBOX</span> <b>build anything — signals run live</b><span class="g-open">▾ how</span>`
      : `<span class="g-tag">◎ BRIEFING</span> <b>${lv.name}</b><span class="g-open">▾ tap to read</span>`;
    $('#lv-goal').onclick = () => showGoalOverlay(false);
    $('#lv-cards').classList.toggle('hidden', isLab);

    const strip = $('#lv-cards');
    strip.innerHTML = '';
    lv.cards.forEach((c, i) => {
      const chip = el('div', 'd-chip', `
        <div class="d-emoji">${c.icon}</div>
        <div class="d-name">${c.name}</div>
        <div class="d-expect">→ ${lv.outputs[c.label].icon} ${lv.outputs[c.label].key}</div>
        <div class="d-tick"></div>`);
      chip.onclick = () => { if (stripDragged) { stripDragged = false; return; } selectCard(i); };
      strip.appendChild(chip);
    });
    strip.onscroll = () => drawCardLinks();
    bindStripDrag(strip);

    const stage = $('#lv-stage');
    stage.querySelectorAll('.out-row, .in-row, .pot-wrap, .nchip, .refblock, .sumnode, .normchip')
      .forEach(n => n.remove());
    $('#lv-board').textContent = lv.code;

    const outRow = el('div', 'out-row' + (lv.outputs.length >= 3 ? ' tight' : ''));
    lv.outputs.forEach((o, p) => {
      const m = el('div', 'meter', `
        <div class="m-head"><span class="m-name">${o.icon} ${o.key}</span><span class="m-val">--%</span></div>
        <div class="ledbar">${'<i></i>'.repeat(10)}</div>
        <div class="m-raw">in <b>0.00</b></div>
        <div class="m-pad" data-port="out:${p}"></div>`);
      outRow.appendChild(m);
    });
    stage.appendChild(outRow);

    const pos = layoutComps(lv);
    lv.comps.forEach(c => {
      const p = (R.compPos && R.compPos[c.id]) || pos[c.id];
      if (c.type === 'neuron') {
        const bars = [];
        for (let i = 0; i < c.nw; i++) bars.push(`
          <div class="nbar"><div class="nb-track"><div class="nb-fill" data-k="${c.id}.w${i}"></div></div><div class="nb-lbl">w${i + 1}</div></div>`);
        bars.push(`<div class="nbar"><div class="nb-track"><div class="nb-fill" data-k="${c.id}.b"></div></div><div class="nb-lbl">b</div></div>`);
        const inPads = [];
        for (let i = 0; i < c.nw; i++) {
          const x = c.nw === 1 ? 50 : 22 + (56 / (c.nw - 1)) * i;
          inPads.push(`<div class="nc-pad in" data-port="${c.id}:in${i}" style="left:calc(${x}% - 8px)"></div>`);
        }
        const chip = el('div', 'nchip', `
          <div class="nc-dot"></div>
          <div class="nc-name">${c.label} · NEURON</div>
          <div class="nbars">${bars.join('')}</div>
          <div class="nc-out">out <b>0.00</b></div>
          <div class="nc-pad out" data-port="${c.id}:out"></div>
          ${inPads.join('')}`);
        chip.style.left = p.x + '%';
        chip.style.top = p.y + '%';
        chip.dataset.node = c.id;
        chip.querySelector('.nc-pad.out').addEventListener('pointerdown',
          e => startWireDrag(e, c.id, 0));
        makeMovable(chip, c.id);
        stage.appendChild(chip);
      } else if (c.type === 'norm') {
        const dials = Object.entries(c.params).map(([pk, spec]) => `
          <div class="ndial" data-param="${pk}">
            <div class="nd-name">${pk === 'zero' ? '0 @' : '±1 @'}</div>
            <div class="pot mini"><div class="tick"></div></div>
            <span class="lcd nd-val">--</span>
          </div>`).join('');
        const nm = el('div', 'normchip', `
          <div class="pin-stub stub-out"></div>
          <div class="pin-stub stub-in"></div>
          <div class="nc-title">${c.label} · NORMALIZER</div>
          <div class="ndials">${dials}</div>
          <div class="pot-out pot-top">out <b>0.00</b></div>
          <div class="pot-pin pin-out" data-port="${c.id}:out"></div>
          <div class="pot-pin pin-in" data-port="${c.id}:in"></div>`);
        nm.style.left = p.x + '%';
        nm.style.top = p.y + '%';
        nm.dataset.node = c.id;
        nm.querySelectorAll('.ndial').forEach(dial => {
          const pk = dial.dataset.param;
          const spec = c.params[pk];
          dial.querySelector('.pot').addEventListener('pointerdown', e =>
            startKnobDrag(e, `${c.id}.${pk}`, nm, dial.querySelector('.pot'),
              { min: spec.min, max: spec.max, step: spec.step }));
        });
        nm.querySelector('.pin-out').addEventListener('pointerdown',
          e => startWireDrag(e, c.id, 0));
        makeMovable(nm, c.id);
        stage.appendChild(nm);
      } else if (c.type === 'sum') {
        const j = el('div', 'sumnode', `
          <div class="sum-disc">Σ</div>
          <div class="pot-out pot-top">out <b>0.00</b></div>
          <div class="pot-pin pin-out" data-port="${c.id}:out"></div>
          <div class="pot-pin pin-in" data-port="${c.id}:in"></div>`);
        j.style.left = p.x + '%';
        j.style.top = p.y + '%';
        j.dataset.node = c.id;
        j.querySelector('.pin-out').addEventListener('pointerdown',
          e => startWireDrag(e, c.id, 0));
        makeMovable(j, c.id);
        stage.appendChild(j);
      } else if (c.frozen) {
        const rb = el('div', 'refblock', `
          <div class="rb-name">${c.label}</div>
          <span class="lcd">×${c.init}</span>`);
        rb.style.left = p.x + '%';
        rb.style.top = p.y + '%';
        rb.dataset.node = c.id;
        makeMovable(rb, c.id);
        stage.appendChild(rb);
      } else {
        const isGate = c.type === 'relu';
        const wrap = el('div', 'pot-wrap' + (isGate ? ' gate' : '') + (lv.freeWiring ? '' : ' static-pads'), `
          <div class="pin-stub stub-out"></div>
          <div class="pin-stub stub-in"></div>
          <div class="pot"><div class="tick"></div></div>
          <div class="pot-pin pin-out" data-port="${c.id}:out"></div>
          <div class="pot-pin pin-in" data-port="${c.id}:in"></div>
          <div class="pot-lbl"><span class="lcd">0.0</span></div>
          <div class="pot-out pot-top">out <b>0.00</b></div>`);
        wrap.style.left = p.x + '%';
        wrap.style.top = p.y + '%';
        wrap.dataset.comp = c.id;
        wrap.querySelector('.pot').addEventListener('pointerdown',
          e => startKnobDrag(e, c.id, wrap));  // ±3 dial (default range)
        wrap.querySelector('.pin-out').addEventListener('pointerdown',
          e => startWireDrag(e, c.id, 0));
        makeMovable(wrap, c.id);
        stage.appendChild(wrap);
      }
    });

    const inRow = el('div', 'in-row');
    lv.inputs.forEach((inp, p) => {
      const b = el('div', 'pinblock', `
        <div class="p-pad" data-port="in:${p}"></div>
        <div class="p-name">${inp.icon} ${inp.key}</div>
        ${isLab
          ? `<div class="pot mini labdial" data-in="${p}"><div class="tick"></div></div>`
          : '<span class="lcd">--</span>'}
        <div class="p-sig">sig <b>0.00</b></div>`);
      b.querySelector('.p-pad').addEventListener('pointerdown',
        e => startWireDrag(e, 'in', p));
      if (isLab) {
        const dial = b.querySelector('.labdial');
        dial.addEventListener('pointerdown', e =>
          startKnobDrag(e, `labin.${p}`, b, dial, { min: -1, max: 1, step: 0.05 }));
      }
      inRow.appendChild(b);
    });
    stage.appendChild(inRow);

    // training console only; star goals live in the briefing overlay
    const isTrain = lv.mode === 'train';
    $('#lv-train').classList.toggle('hidden', !isTrain);
    $('#lv-labtray').classList.toggle('hidden', !isLab);
    $('#lv-test').parentElement.classList.toggle('hidden', isLab);
    $('#lv-test').textContent = isTrain ? '⏻ FINISH — CLAIM STARS' : '⏻ SUBMIT CIRCUIT';
    if (isLab) {
      $('#lab-count').textContent = `${labPartCount()}/6`;
      // removable parts
      stage.querySelectorAll('.pot-wrap, .sumnode').forEach(node => {
        const id = node.dataset.comp || node.dataset.node;
        if (!id || !id.startsWith('L')) return;
        const del = el('div', 'comp-del', '✕');
        del.onclick = (e) => { e.stopPropagation(); removeLabPart(id); };
        node.appendChild(del);
      });
    }
    if (isTrain) {
      $('#lv-lr-row').classList.toggle('hidden', !!lv.lr.locked);
      $('#lv-lr').value = Math.log10(R.lr);
      $('#lv-lr-val').textContent = R.lr.toFixed(2);
      updateTrainHud();
    }

    refreshChipsActive();
    const owner = R;
    nextFrame(() => {
      if (R !== owner) return; // level was left before the frame ran
      renderWires();
      updateLive();
      selectCard(R.activeCard); // center the active card + draw its links
    });
  }

  function renderBestStars() {
    const st = starsOf(R.level.id);
    $('#lv-stars').innerHTML =
      `<span class="star${st >= 1 ? '' : ' off'}">★</span><span class="star${st >= 2 ? '' : ' off'}">★</span><span class="star${st >= 3 ? '' : ' off'}">★</span>`;
  }

  function refreshChipsActive() {
    document.querySelectorAll('#lv-cards .d-chip').forEach((chip, i) => {
      chip.classList.toggle('active', i === R.activeCard);
    });
  }

  let stripDragged = false;
  function bindStripDrag(strip) {
    strip.onpointerdown = e => {
      stripDragged = false;
      // Touch/pen already scroll natively (touch-action: pan-x); only mice need this.
      if (e.pointerType !== 'mouse') return;
      const startX = e.clientX, startL = strip.scrollLeft;
      const move = ev => {
        if (Math.abs(ev.clientX - startX) > 6) stripDragged = true;
        if (stripDragged) strip.scrollLeft = startL - (ev.clientX - startX);
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    };
  }

  function selectCard(i) {
    R.activeCard = i;
    refreshChipsActive();
    // Scroll the STRIP only (never scrollIntoView — it scrolls ancestors
    // and can drag the whole app frame off-screen).
    const strip = $('#lv-cards');
    const chip = strip.querySelectorAll('.d-chip')[i];
    if (chip) {
      strip.scrollTo({
        left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2,
        behavior: 'smooth'
      });
    }
    updateLive();
    // switching to a card runs its test (once the briefing is dismissed)
    if (R.cardMarks[i] === undefined) scheduleTest(420);
  }

  // The active card plugs into the input pins — draw its connector traces
  // so the card ⇄ input-values relationship is visible.
  function drawCardLinks() {
    const svg = $('#lv-cardlinks');
    if (!svg || !R) return;
    const wrap = $('#lv-boardarea');
    const wr = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${wr.width} ${wr.height}`);
    const chip = document.querySelectorAll('#lv-cards .d-chip')[R.activeCard];
    if (!chip) { svg.innerHTML = ''; return; }
    const cr = chip.getBoundingClientRect();
    const cx = cr.left + cr.width / 2 - wr.left;
    const cy = cr.top - wr.top + 2;
    let html = '';
    document.querySelectorAll('#lv-stage .in-row .pinblock').forEach(b => {
      const br = b.getBoundingClientRect();
      const bx = br.left + br.width / 2 - wr.left;
      const by = br.bottom - wr.top - 2;
      const midY = (cy + by) / 2;
      html += `<path d="M ${cx} ${cy} L ${cx} ${midY + 7} L ${bx} ${midY - 7} L ${bx} ${by}"
        stroke="rgba(233,185,79,0.8)" stroke-width="2.2" fill="none"
        stroke-dasharray="7 4" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
    html += `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#E9B94F"/>`;
    svg.innerHTML = html;
  }

  /* ---------- wiring ---------- */
  function portCenter(portId) {
    const elp = document.querySelector(`[data-port="${portId}"]`);
    if (!elp) return null;
    const sr = $('#lv-stage').getBoundingClientRect();
    const r = elp.getBoundingClientRect();
    return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top };
  }
  function srcPortId(n, p) { return n === 'in' ? `in:${p}` : `${n}:out`; }
  function tgtPortId(n, p) { return n === 'out' ? `out:${p}` : `${n}:in`; }

  // for comps without visible pins (neurons, gates in fixed boards) route to element center
  function nodeCenter(n) {
    const sr = $('#lv-stage').getBoundingClientRect();
    const q = document.querySelector(`.pot-wrap[data-comp="${n}"] .pot`) ||
              document.querySelector(`[data-node="${n}"]`);
    if (q) {
      const r = q.getBoundingClientRect();
      return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top };
    }
    return null;
  }

  function endpointFor(kind, n, p) {
    // per-port pad (neurons) → generic pad → component body center
    let c = null;
    if (kind !== 'src') c = portCenter(`${n}:in${p}`);
    if (!c) c = portCenter(kind === 'src' ? srcPortId(n, p) : tgtPortId(n, p));
    if (!c) c = nodeCenter(n);
    return c;
  }

  function renderWires() {
    const svg = $('#lv-wires');
    const sr = $('#lv-stage').getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
    svg.innerHTML = '';
    R.wirePaths = [];
    R.wires.forEach((w, i) => {
      const a = endpointFor('src', w.from.n, w.from.p);
      const b = endpointFor('tgt', w.to.n, w.to.p);
      if (!a || !b) return;
      const midY = (a.y + b.y) / 2;
      const off = Math.max(2, Math.min(11, Math.abs(a.y - b.y) / 6));
      const sgn = a.y >= b.y ? 1 : -1;
      const d = `M ${a.x} ${a.y} L ${a.x} ${midY + sgn * off} L ${b.x} ${midY - sgn * off} L ${b.x} ${b.y}`;
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'wirehit');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', 'wire' + (w.locked ? ' locked' : ''));
      if (!w.locked) {
        const kill = () => {
          R.wires.splice(i, 1);
          invalidateTests();
          renderWires(); updateLive();
          scheduleTest();
        };
        hit.onclick = kill; p.onclick = kill;
      }
      svg.appendChild(hit);
      svg.appendChild(p);
      R.wirePaths.push({ el: p, from: w.from.n, toN: w.to.n });
      const via = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      via.setAttribute('class', 'via');
      via.setAttribute('r', '3.4');
      via.setAttribute('cx', a.x); via.setAttribute('cy', (a.y + midY + 11) / 2);
      svg.appendChild(via);
    });

    // ghost wire while dragging
    if (R.drag && R.drag.pt) {
      const a = endpointFor('src', R.drag.from.n, R.drag.from.p);
      if (a) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        g.setAttribute('d', `M ${a.x} ${a.y} L ${R.drag.pt.x} ${R.drag.pt.y}`);
        g.setAttribute('class', 'ghost');
        svg.appendChild(g);
      }
    }
  }

  /* ---------- movable components ---------- */
  // Any module body can be dragged to reposition it on the board; knobs, pads
  // and delete buttons keep their own gestures. Wires follow live.
  function makeMovable(node, id) {
    node.addEventListener('pointerdown', e => {
      if (e.target.closest('[data-port], .pot, .comp-del, .labdial')) return;
      const sr = $('#lv-stage').getBoundingClientRect();
      const nr = node.getBoundingClientRect();
      const dx = e.clientX - (nr.left + nr.width / 2);
      const dy = e.clientY - (nr.top + nr.height / 2);
      const sx = e.clientX, sy = e.clientY;
      let moved = false;
      const mm = ev => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        moved = true;
        const x = Math.max(6, Math.min(94, ((ev.clientX - dx - sr.left) / sr.width) * 100));
        const y = Math.max(14, Math.min(88, ((ev.clientY - dy - sr.top) / sr.height) * 100));
        node.style.left = x + '%';
        node.style.top = y + '%';
        (R.compPos = R.compPos || {})[id] = { x, y };
        renderWires(); drawCardLinks();
      };
      const up = () => {
        window.removeEventListener('pointermove', mm);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        node.classList.remove('dragging');
      };
      node.classList.add('dragging');
      window.addEventListener('pointermove', mm);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      e.preventDefault();
    });
  }

  /* ---------- drag & drop wiring ---------- */
  function parsePortTarget(pid) {
    // valid targets: "out:P", "comp:in", "comp:inP"
    if (pid.startsWith('out:')) return { n: 'out', p: +pid.slice(4) };
    const m = pid.match(/^(.+):in(\d*)$/);
    if (m) return { n: m[1], p: m[2] ? +m[2] : 0 };
    return null;
  }

  function markTargets(on) {
    document.querySelectorAll('[data-port]').forEach(elp => {
      const t = parsePortTarget(elp.dataset.port);
      const valid = on && t && R.drag && !E.feedsInto(R.wires, t.n, R.drag.from.n);
      elp.classList.toggle('droppable', !!valid);
    });
  }

  function startWireDrag(e, n, p) {
    if (!R.level.freeWiring) return;
    e.preventDefault();
    e.stopPropagation();
    R.drag = { from: { n, p }, pt: null };
    const srcEl = document.querySelector(`[data-port="${srcPortId(n, p)}"]`);
    if (srcEl) srcEl.classList.add('armed');
    markTargets(true);

    const move = ev => {
      const sr = $('#lv-stage').getBoundingClientRect();
      R.drag.pt = { x: ev.clientX - sr.left, y: ev.clientY - sr.top };
      renderWires();
    };
    const up = ev => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      finishWireDrag(ev.clientX, ev.clientY);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    move(e);
  }

  function dropTargetAt(cx, cy) {
    // direct hit first, then a generous 26px snap radius (fingers are wide)
    const hit = document.elementFromPoint(cx, cy);
    const direct = hit && hit.closest && hit.closest('[data-port]');
    if (direct) {
      const t = parsePortTarget(direct.dataset.port);
      if (t) return t;
    }
    let best = null, bestD = 26;
    document.querySelectorAll('[data-port]').forEach(elp => {
      const t = parsePortTarget(elp.dataset.port);
      if (!t) return;
      const r = elp.getBoundingClientRect();
      const d = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2));
      if (d < bestD) { bestD = d; best = t; }
    });
    return best;
  }

  // true if signal leaving part `a` already reaches part `b` (so b→a would loop)
  function finishWireDrag(cx, cy) {
    markTargets(false);
    document.querySelectorAll('.armed').forEach(n => n.classList.remove('armed'));
    const from = R.drag.from;
    const t = dropTargetAt(cx, cy);
    R.drag = null;
    if (t && t.n !== from.n && E.feedsInto(R.wires, t.n, from.n)) {
      toast('No loops — signals only flow forward');
    } else if (t && t.n !== from.n) {
      // One wire per spot — merging is what Σ junctions are FOR
      // (and a GATE is "a junction with attitude", so it merges too).
      const tComp = R.level.comps.find(c => c.id === t.n);
      const sums = tComp && (tComp.type === 'sum' || tComp.type === 'relu');
      if (!sums) {
        const existing = R.wires.findIndex(w => w.to.n === t.n && w.to.p === t.p && !w.locked);
        if (existing >= 0) R.wires.splice(existing, 1);
      }
      const dup = R.wires.some(w =>
        w.from.n === from.n && w.from.p === from.p && w.to.n === t.n && w.to.p === t.p);
      if (!dup) { R.wires.push({ from, to: t, locked: false }); invalidateTests(); scheduleTest(); }
    }
    renderWires();
    updateLive();
  }

  /* ---------- rotary knob: drag to turn (like a real pot) ---------- */
  function startKnobDrag(e, key, wrap, potEl, range) {
    e.preventDefault();
    e.stopPropagation();
    const pot = potEl || wrap.querySelector('.pot');
    const rg = range || { min: -3, max: 3, step: 0.05 };
    wrap.classList.add('turning');
    const setFromPointer = ev => {
      const r = pot.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      // dial sweep: -135deg = min ... +135deg = max
      let ang = Math.atan2(ev.clientX - cx, cy - ev.clientY) * 180 / Math.PI;
      ang = Math.max(-135, Math.min(135, ang));
      const raw = rg.min + (ang + 135) / 270 * (rg.max - rg.min);
      const nv = Math.round(raw / rg.step) * rg.step;
      if (nv !== R.weights[key]) { R.weights[key] = nv; invalidateTests(); }
      updateLive();
    };
    const move = ev => setFromPointer(ev);
    const up = () => {
      wrap.classList.remove('turning');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      scheduleTest();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    setFromPointer(e);
  }

  /* ---------- training console ---------- */
  function updateTrainHud() {
    $('#tr-epoch').textContent = String(R.epoch).padStart(3, '0');
    const ev = E.evaluate(R.level, { wires: R.wires, weights: R.weights });
    $('#tr-sorted').textContent = `${ev.perCard.filter(p => p.ok).length}/${R.level.cards.length}`;
    // loss sparkline
    const hist = R.lossHist.slice(-40);
    const svg = $('#tr-spark');
    if (hist.length >= 2) {
      const mx = Math.max(...hist, 0.01);
      const pts = hist.map((v, i) =>
        `${(i / (hist.length - 1)) * 56 + 2},${22 - (v / mx) * 18}`).join(' ');
      svg.innerHTML = `<polyline points="${pts}" stroke="#FF5349" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    } else {
      svg.innerHTML = '';
    }
    return ev;
  }

  function doEpochs(n) {
    for (let i = 0; i < n; i++) {
      E.trainEpoch(R.level, { wires: R.wires, weights: R.weights }, R.lr);
      R.epoch++;
      const ev = E.evaluate(R.level, { wires: R.wires, weights: R.weights });
      R.lossHist.push(ev.avgLoss);
      if (ev.allCorrect) return ev;
    }
    return null;
  }

  function stopTraining() {
    if (R && R.timer) { clearInterval(R.timer); R.timer = null; }
    const btn = $('#tr-run');
    if (btn) { btn.innerHTML = '⚡ TRAIN'; btn.classList.remove('running'); }
  }

  function toggleTraining() {
    if (R.timer) { stopTraining(); return; }
    const btn = $('#tr-run');
    btn.innerHTML = '⏸ PAUSE';
    btn.classList.add('running');
    R.timer = setInterval(() => {
      const solved = doEpochs(1);
      updateLive();
      updateTrainHud();
      if (solved) {
        stopTraining();
        toast(`All sorted at epoch ${R.epoch} — press ⏻ FINISH to claim stars!`);
      } else if (R.epoch > 999) {
        stopTraining();
        toast('1000 epochs and no luck — try ↺ RESET and a different throttle');
      }
    }, 80);
  }

  function resetChip() {
    stopTraining();
    R.weights = initWeights(R.level);
    R.epoch = 0;
    R.lossHist = [];
    updateLive();
    updateTrainHud();
    toast('Chip reset — back to the factory start, epoch 0');
  }

  $('#lv-lr').addEventListener('input', e => {
    if (!R) return;
    R.lr = Math.min(3, Math.pow(10, parseFloat(e.target.value)));
    $('#lv-lr-val').textContent = R.lr.toFixed(2);
  });

  /* ---------- live simulation ---------- */
  function fmt(v) { return (v >= 0 ? '' : '−') + Math.abs(v).toFixed(2); }

  // Natural display units: 0.7 heat reads as "70°", clouds as "70%".
  // (Internally everything stays 0..1 — normalization, quietly.)
  function fmtInput(inp, v) {
    if (inp.constant) return '+' + Math.round(v);
    const scale = inp.scale !== undefined ? inp.scale : 100;
    const unit = inp.unit || '%';
    const raw = v * scale + (inp.offset || 0);
    return (inp.dec ? raw.toFixed(inp.dec) : Math.round(raw)) + unit;
  }

  function updateLive() {
    if (!R) return;
    const lv = R.level;
    const state = { wires: R.wires, weights: R.weights };

    lv.comps.forEach(c => {
      if (c.type === 'neuron') {
        for (let i = 0; i <= c.nw; i++) {
          const k = i < c.nw ? `${c.id}.w${i}` : `${c.id}.b`;
          const fill = document.querySelector(`.nb-fill[data-k="${k}"]`);
          if (fill) {
            const v = R.weights[k] || 0;
            fill.style.height = Math.min(100, Math.abs(v) / 3 * 100) + '%';
            fill.style.background = v >= 0 ? 'var(--led-grn)' : 'var(--led-red)';
          }
        }
      } else if (c.type === 'norm') {
        const nm = document.querySelector(`[data-node="${c.id}"]`);
        if (!nm) return;
        nm.querySelectorAll('.ndial').forEach(dial => {
          const pk = dial.dataset.param;
          const spec = c.params[pk];
          const v = R.weights[`${c.id}.${pk}`];
          const frac = (v - spec.min) / (spec.max - spec.min);
          dial.querySelector('.tick').style.transform =
            `translateX(-50%) rotate(${-135 + frac * 270}deg)`;
          dial.querySelector('.nd-val').textContent =
            (spec.dec ? v.toFixed(spec.dec) : Math.round(v)) + (spec.unit || '');
        });
      } else if (!c.frozen) {
        const wrap = document.querySelector(`.pot-wrap[data-comp="${c.id}"]`);
        if (!wrap) return;
        const w = R.weights[c.id];
        wrap.querySelector('.tick').style.transform =
          `translateX(-50%) rotate(${(w / 3) * 135}deg)`;
        // amp reads as a multiplier (×2.40), gate as a bias (b −1.50)
        wrap.querySelector('.pot-lbl .lcd').textContent =
          c.type === 'relu' ? 'b ' + fmt(w) : '×' + fmt(w);
      }
    });

    const card = lv.cards[R.activeCard];
    if (lv.lab) card.f = lv.inputs.map((_, p) => R.weights['labin.' + p] !== undefined ? R.weights['labin.' + p] : 0.5);
    const fw = E.forward(lv, state, card.f);
    const win = E.predict(fw);

    // every element publishes its live output signal
    lv.comps.forEach(c => {
      const host = document.querySelector(
        `.pot-wrap[data-comp="${c.id}"] .pot-out b, ` +
        `[data-node="${c.id}"] .nc-out b, [data-node="${c.id}"] .pot-out b`);
      if (host) host.textContent = fmt(fw.val[c.id + ':0'] || 0);
    });
    document.querySelectorAll('#lv-stage .in-row .pinblock').forEach((b, p) => {
      if (lv.lab) {
        const dial = b.querySelector('.labdial');
        if (dial) {
          const frac = (card.f[p] + 1) / 2;
          dial.querySelector('.tick').style.transform =
            `translateX(-50%) rotate(${-135 + frac * 270}deg)`;
        }
      } else {
        b.querySelector('.lcd').textContent = fmtInput(lv.inputs[p], card.f[p]);
      }
      const sig = b.querySelector('.p-sig');
      if (lv.noSig) sig.classList.add('hidden');
      else { sig.classList.remove('hidden'); sig.querySelector('b').textContent = fmt(card.f[p]); }
    });
    document.querySelectorAll('#lv-stage .out-row .meter').forEach((m, p) => {
      const pct = fw.softmax[p];
      m.querySelector('.m-val').textContent = Math.round(pct * 100) + '%';
      const leds = m.querySelectorAll('.ledbar i');
      const onN = Math.round(pct * 10);
      leds.forEach((led, i) => led.classList.toggle('on', i < onN));
      m.classList.toggle('winner', p === win);
      m.querySelector('.m-raw b').textContent = fmt(fw.scores[p]);
    });

    if (lv.mode === 'train') {
      // training monitor keeps live sorting marks — that's its job
      const ev = E.evaluate(lv, state);
      document.querySelectorAll('#lv-cards .d-chip').forEach((chip, i) => {
        const pc = ev.perCard[i];
        chip.classList.toggle('ok', pc.ok);
        chip.classList.toggle('bad', !pc.ok);
        chip.querySelector('.d-tick').textContent = pc.ok ? '✓' : '✗';
      });
      updateTrainHud();
    } else {
      paintCardMarks(); // marks only from explicit per-card tests
    }
    drawCardLinks();
  }

  /* ---------- briefing overlay ---------- */
  function starGoalsHtml(lv) {
    if (lv.lab) return '<span>🔬 sandbox — no stars, no wrong answers</span>';
    return lv.mode === 'train'
      ? `<span><span class="star">★</span> all sorted</span>
         <span><span class="star">★★</span> ≤ ${lv.pars.p2} epochs</span>
         <span><span class="star">★★★</span> ≤ ${lv.pars.p3} epochs</span>`
      : `<span><span class="star">★</span> all cards pass</span>
         <span><span class="star">★★</span> ≥ ${Math.round(lv.stars.s2 * 100)}%</span>
         <span><span class="star">★★★</span> ≥ ${Math.round(lv.stars.s3 * 100)}%</span>`;
  }

  function showGoalOverlay(first) {
    const lv = R.level;
    const back = $('#modal-goal');
    back.innerHTML = '';
    const sheet = el('div', 'goal-sheet', `
      <div class="gs-tag">◎ MISSION BRIEFING · ${lv.code}</div>
      <h2>${lv.name}</h2>
      <p>${lv.goal}</p>
      <div class="gs-stars">${starGoalsHtml(lv)}</div>
      <button class="btn btn-grn">${first ? '▶ START LEVEL' : '▶ BACK TO BOARD'}</button>`);
    sheet.querySelector('.btn').onclick = () => {
      back.classList.add('hidden');
      if (first) scheduleTest(420);
    };
    back.appendChild(sheet);
    back.classList.remove('hidden');
  }

  /* ---------- per-card testing ---------- */
  let animating = false;
  let cancelAnim = null; // aborts the in-flight signal animation

  // leaving a level: drop any pending check so it can't grade the next one
  function cancelChecks() {
    if (R) clearTimeout(R.autoTestT);
    if (cancelAnim) cancelAnim();
  }

  function paintCardMarks() {
    if (!R) return;
    document.querySelectorAll('#lv-cards .d-chip').forEach((chip, i) => {
      const mk = R.cardMarks[i];
      chip.classList.toggle('ok', mk === 'ok');
      chip.classList.toggle('bad', mk === 'bad');
      chip.querySelector('.d-tick').textContent = mk === 'ok' ? '✓' : mk === 'bad' ? '✗' : '';
    });
  }

  // circuit changed → previous verdicts no longer hold
  function invalidateTests() {
    if (!R || R.level.mode === 'train') return;
    R.cardMarks = {};
    R.validated = new Set();
    paintCardMarks();
  }

  // Signals travel in STAGES: input pins feed the first modules; once a
  // module has all its inputs it emits, and so on until the outputs light.
  function flashNode(n) {
    const sel = n === 'out'
      ? '#lv-stage .out-row .m-val, #lv-stage .out-row .m-raw'
      : `[data-node="${n}"] .pot-out, .pot-wrap[data-comp="${n}"] .pot-out, ` +
        `.pot-wrap[data-comp="${n}"] .lcd, [data-node="${n}"] .lcd, ` +
        `[data-node="${n}"] .nb-fill`;
    document.querySelectorAll(sel).forEach(el2 => {
      el2.classList.add('flash');
      setTimeout(() => el2.classList.remove('flash'), 500);
    });
  }

  function animateSignals(done) {
    const svg = $('#lv-wires');
    const paths = (R.wirePaths || []).filter(wp => wp.el.isConnected);
    if (!paths.length) { done(); return; }
    animating = true;
    const owner = R;

    // depth of each source: inputs 0, then 1 + deepest feeder
    const depth = {};
    R.level.comps.forEach(c => { depth[c.id] = 1; });
    for (let k = 0; k < 4; k++) {
      R.level.comps.forEach(c => {
        R.wires.forEach(w => {
          if (w.to.n === c.id && w.from.n !== 'in') {
            depth[c.id] = Math.max(depth[c.id], (depth[w.from.n] || 1) + 1);
          }
        });
      });
    }
    const stages = {};
    paths.forEach(wp => {
      const st = wp.from === 'in' ? 0 : (depth[wp.from] || 1);
      (stages[st] = stages[st] || []).push(wp);
    });
    const order = Object.keys(stages).map(Number).sort((a, b) => a - b);

    let si = 0;
    let allDone = false;
    const finishAll = cancelled => {
      if (allDone) return;
      allDone = true;
      animating = false;
      cancelAnim = null;
      svg.querySelectorAll('.sig-dot').forEach(d => d.remove());
      if (cancelled !== true && R === owner) done();
    };
    cancelAnim = () => finishAll(true);
    const DUR = 380;
    const runStage = () => {
      if (allDone) return;
      if (si >= order.length) { finishAll(); return; }
      const group = stages[order[si]];
      const arrived = new Set(group.map(wp => wp.toN));
      const dots = [];
      let stageOver = false;
      group.forEach(wp => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'sig-dot');
        dot.setAttribute('r', '5');
        svg.appendChild(dot);
        dots.push(dot);
        let L = 0;
        try { L = wp.el.getTotalLength(); } catch (e) { /* detached mid-flight */ }
        const t0 = performance.now();
        const step = now => {
          if (stageOver || allDone) return;
          const t = Math.min(1, (now - t0) / DUR);
          try {
            const pt = wp.el.getPointAtLength(L * t);
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
          } catch (e) { /* path gone — clock still finishes the stage */ }
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      // the CLOCK: fires even when rAF is suspended (hidden webview)
      setTimeout(() => {
        if (stageOver || allDone) return;
        stageOver = true;
        dots.forEach(d => d.remove());
        arrived.forEach(flashNode);
        si++;
        setTimeout(runStage, 110);
      }, DUR + 40);
    };
    // belt & braces: whole animation can never outlive its budget
    setTimeout(finishAll, order.length * (DUR + 160) + 600);
    runStage();
  }

  // one debounced re-test of the current card after any circuit change
  function scheduleTest(delay) {
    if (!R || R.level.mode === 'train' || R.level.lab) return;
    clearTimeout(R.autoTestT);
    R.autoTestT = setTimeout(() => {
      if (!R) return;
      if (animating) { scheduleTest(200); return; }
      if ($('#modal-goal').classList.contains('hidden')
          && $('#modal-win').classList.contains('hidden')) testCard();
    }, delay || 380);
  }

  function testCard() {
    if (!R || animating) return;
    const lv = R.level;
    if (lv.mode === 'train') { testAll(); return; }
    const i = R.activeCard;
    animateSignals(() => {
      const card = lv.cards[i];
      const fw = E.forward(lv, { wires: R.wires, weights: R.weights }, card.f);
      const ok = E.predict(fw) === card.label;
      R.cardMarks[i] = ok ? 'ok' : 'bad';
      if (ok) R.validated.add(i); else R.validated.delete(i);
      paintCardMarks();
    });
  }

  function finishLevel() {
    const lv = R.level;
    const ev = E.evaluate(lv, { wires: R.wires, weights: R.weights });
    const prev = starsOf(lv.id);
    if (ev.stars > prev) {
      progress[lv.id] = ev.stars;
      store.save(PROGRESS_KEY, progress);
    }
    renderBestStars();
    confettiBurst();
    showWin(ev, ev.stars);
  }

  // the player submits the finished circuit — the whole deck is graded
  function submitCircuit() {
    if (!R) return;
    if (animating) { // wait out the pulse
      const owner = R;
      setTimeout(() => { if (R === owner) submitCircuit(); }, 250);
      return;
    }
    const lv = R.level;
    if (lv.mode === 'train') { testAll(); return; }
    animateSignals(() => {
      const ev = E.evaluate(lv, { wires: R.wires, weights: R.weights });
      ev.perCard.forEach((pc, i) => {
        R.cardMarks[i] = pc.ok ? 'ok' : 'bad';
        if (pc.ok) R.validated.add(i); else R.validated.delete(i);
      });
      paintCardMarks();
      if (ev.allCorrect) finishLevel();
      else toast(`${ev.perCard.filter(pc => pc.ok).length}/${lv.cards.length} cards pass — keep tuning!`);
    });
  }

  // instant whole-deck check (used by the automated regression suite)
  function testAllInstant() {
    const lv = R.level;
    if (lv.mode === 'train') { testAll(); return; }
    const ev = E.evaluate(lv, { wires: R.wires, weights: R.weights });
    ev.perCard.forEach((pc, i) => {
      R.cardMarks[i] = pc.ok ? 'ok' : 'bad';
      if (pc.ok) R.validated.add(i);
    });
    paintCardMarks();
    if (ev.allCorrect) finishLevel();
  }

  /* ---------- test / win ---------- */
  function confettiBurst() {
    const colors = ['#E9B94F', '#4AE581', '#FF5349', '#61B8FF', '#FFD98A'];
    for (let i = 0; i < 26; i++) {
      const c = el('div', 'confetti');
      c.style.left = (8 + Math.random() * 84) + '%';
      c.style.top = (40 + Math.random() * 80) + 'px';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      $('#app').appendChild(c);
      setTimeout(() => c.remove(), 2300);
    }
  }

  function testAll() {
    stopTraining();
    const lv = R.level;
    const ev = E.evaluate(lv, { wires: R.wires, weights: R.weights });
    let stars = ev.stars;
    if (lv.mode === 'train') {
      stars = 0;
      if (ev.allCorrect) {
        stars = 1;
        if (R.epoch <= lv.pars.p2) stars = 2;
        if (R.epoch <= lv.pars.p3) stars = 3;
      }
    }
    if (stars === 0) {
      const n = ev.perCard.filter(p => p.ok).length;
      toast(lv.mode === 'train'
        ? `${n}/${lv.cards.length} sorted — train some more!`
        : `${n}/${lv.cards.length} cards correct — keep tuning!`);
      return;
    }
    const prev = starsOf(lv.id);
    if (stars > prev) {
      progress[lv.id] = stars;
      store.save(PROGRESS_KEY, progress);
    }
    renderBestStars();
    confettiBurst();
    showWin(ev, stars);
  }

  function showWin(ev, stars) {
    const lv = R.level;
    const back = $('#modal-win');
    back.innerHTML = '';
    const idx = levelIdx(lv.id);
    const hasNext = idx + 1 < flat.length;
    const isTrain = lv.mode === 'train';
    const rows = isTrain ? `
      <div class="stat-row"><span>Cards sorted</span><span class="sr-v good">${ev.perCard.filter(p => p.ok).length} / ${lv.cards.length}</span></div>
      <div class="stat-row"><span>Epochs used</span><span class="sr-v">${R.epoch} <span style="color:#98A3B1">(★★★ ≤ ${lv.pars.p3})</span></span></div>
      ${stars < 3 ? `<div class="stat-row"><span>★★★ tip</span><span class="sr-v tip">${lv.tip}</span></div>` : ''}` : `
      <div class="stat-row"><span>Cards correct</span><span class="sr-v good">${ev.perCard.filter(p => p.ok).length} / ${lv.cards.length}</span></div>
      <div class="stat-row"><span>Weakest card's confidence</span><span class="sr-v">${(ev.minConf * 100).toFixed(1)}%</span></div>
      <div class="w-note">Stars reward <b>certainty</b>, not just correct answers — the meters show how sure
      the board is. Louder evidence ⇒ higher confidence ⇒ more ★.</div>
      ${stars < 3 ? `<div class="stat-row"><span>★★★ tip</span><span class="sr-v tip">${lv.tip}</span></div>` : ''}`;
    const card = el('div', 'win-card', `
      <div class="win-stars">
        <span class="wstar ${stars >= 1 ? '' : 'off'}">★</span>
        <span class="wstar mid ${stars >= 2 ? '' : 'off'}">★</span>
        <span class="wstar ${stars >= 3 ? '' : 'off'}">★</span>
      </div>
      <div class="stamp">QC PASS</div>
      <h2>${stars === 3 ? (isTrain ? 'Perfectly trained!' : 'Flawless circuit!') : (isTrain ? 'Chip trained!' : 'Board works!')}</h2>
      <div class="w-sub">${lv.code}</div>
      <div class="stat-rows">${rows}</div>
      <div class="win-buttons">
        ${hasNext ? '<button class="btn btn-grn" id="w-next">CONTINUE ▶</button>' : '<button class="btn btn-grn" id="w-next">BACK TO BOARD 🗺️</button>'}
        ${stars < 3 ? '<button class="btn btn-ghost" id="w-improve">↻ IMPROVE FOR ★★★</button>' : ''}
        <button class="btn btn-ghost" id="w-map">BACK TO MAP</button>
      </div>`);
    back.appendChild(card);
    back.classList.remove('hidden');

    card.querySelectorAll('.wstar').forEach((s, i) => {
      if (!s.classList.contains('off')) setTimeout(() => s.classList.add('show'), 150 + i * 260);
    });

    $('#w-next').onclick = () => {
      back.classList.add('hidden');
      if (hasNext) openLevel(flat[idx + 1].lv.id);
      else backToMap();
    };
    const imp = $('#w-improve');
    if (imp) imp.onclick = () => {
      back.classList.add('hidden');
      if (isTrain) resetChip();
    };
    $('#w-map').onclick = () => { back.classList.add('hidden'); backToMap(); };
  }

  /* ---------- bindings ---------- */
  $('#lv-back').onclick = backToMap;
  $('#lv-test').onclick = submitCircuit;
  $('#tr-step').onclick = () => {
    if (!R) return;
    const solved = doEpochs(1);
    updateLive(); updateTrainHud();
    if (solved) toast(`All sorted at epoch ${R.epoch} — press ⏻ FINISH to claim stars!`);
  };
  $('#tr-run').onclick = () => R && toggleTraining();
  $('#tr-reset').onclick = () => R && resetChip();
  document.querySelectorAll('.tab[data-nav]').forEach(t => {
    t.onclick = () => switchTab(t.dataset.nav);
  });
  document.querySelectorAll('#lv-labtray [data-part]').forEach(b => {
    b.onclick = () => addLabPart(b.dataset.part);
  });
  $('#lab-clear').onclick = () => {
    if (!R || !R.level.lab) return;
    R.level.comps = [];
    R.wires = [];
    Object.keys(R.weights).forEach(k => { if (!k.startsWith('labin.')) delete R.weights[k]; });
    renderLevel();
  };
  window.addEventListener('resize', () => { if (R) { renderWires(); drawCardLinks(); } });

  /* expose for testing */
  window.NQ = {
    openLevel, backToMap, testAll: testAllInstant, testCard,
    state: () => R, progress: () => progress,
    setWeight: (id, w) => { R.weights[id] = w; invalidateTests(); updateLive(); },
    setLR: v => { R.lr = v; },
    trainEpochs: n => { const s = doEpochs(n); updateLive(); updateTrainHud(); return s; },
    addWire: (fn, fp, tn, tp) => { R.wires.push({ from: { n: fn, p: fp }, to: { n: tn, p: tp }, locked: false }); invalidateTests(); renderWires(); updateLive(); },
    reset: () => { progress = {}; seenIntro = {}; store.save(PROGRESS_KEY, {}); store.save('nq.intro.v1', {}); renderMap(); }
  };

  renderMap();
})();
