// Runs the Android back-button script (kBackScript in lib/main.dart) against
// a stub DOM for each screen/modal state and checks what it clicks.
// Run: node test/back_script_test.mjs  (also invoked by widget_test.dart)
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const dart = readFileSync(join(dir, '../lib/main.dart'), 'utf8');
const m = dart.match(/const String kBackScript = '''([\s\S]*?)''';/);
if (!m) { console.error('kBackScript not found in lib/main.dart'); process.exit(1); }
const SCRIPT = m[1];

// Minimal DOM: just the ids, classes and selectors the script touches.
function makeDom(openIds) {
  const clicked = [];
  const node = (id, cls = []) => ({
    id,
    classList: { contains: c => (c === 'hidden' ? !openIds.includes(id) : cls.includes(c)) },
    click() { clicked.push(id); }
  });
  const els = {};
  ['modal-win', 'modal-datasheet', 'modal-goal', 'scr-level', 'scr-awards', 'scr-map']
    .forEach(id => { els[id] = node(id); });
  const sel = {
    '#w-map': node('w-map'),
    '#modal-datasheet .btn': node('datasheet-btn'),
    '#modal-goal .btn': node('goal-btn'),
    '#scr-awards .tab[data-nav="map"]': node('awards-map-tab')
  };
  const document = {
    getElementById: id => els[id] || null,
    querySelector: s => (s in sel ? sel[s] : null)
  };
  let backToMap = 0;
  const window = { NQ: { backToMap() { backToMap++; } } };
  const result = new Function('document', 'window', 'NQ', `return ${SCRIPT.trim()};`)(
    document, window, window.NQ);
  return { result, clicked, backToMap };
}

let fail = 0;
function check(name, open, expect) {
  const r = makeDom(open);
  const ok = r.result === expect.result &&
    JSON.stringify(r.clicked) === JSON.stringify(expect.clicked || []) &&
    r.backToMap === (expect.backToMap || 0);
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}` + (ok ? '' : `  got ${JSON.stringify(r)}`));
}

check('win modal → BACK TO MAP (not CONTINUE)', ['scr-level', 'modal-win'], { result: true, clicked: ['w-map'] });
check('sector datasheet → its dismiss button', ['scr-level', 'modal-datasheet'], { result: true, clicked: ['datasheet-btn'] });
check('goal briefing → its dismiss button', ['scr-level', 'modal-goal'], { result: true, clicked: ['goal-btn'] });
check('in a level, no modal → backToMap()', ['scr-level'], { result: true, backToMap: 1 });
check('awards screen → Journey tab', ['scr-awards'], { result: true, clicked: ['awards-map-tab'] });
check('map screen → not consumed (app exits)', ['scr-map'], { result: false });

process.exit(fail ? 1 : 0);
