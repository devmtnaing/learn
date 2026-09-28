/* The walkthrough engine. It renders every interactive part of a solution
 * page from a lesson's data: part 2's approach tabs (2·1) and player card
 * (2·2) — inputs and preset chips, the array strip, transport, narration, the
 * stage beside the live code — plus the example cards and the part 3 solution
 * blocks. Every page gets the same markup, so lesson.css styles them alike.
 *
 * A lesson supplies data and nothing else:
 *
 *   mountLesson({
 *     input,                 the starting input
 *     controls,              [{ key, label, type, parse, format? }]
 *     presets,               [{ label, input }]          chips beside the fields
 *     examples,              [{ title, inputHtml, output, why, load }]  part 1 cards
 *     modes,                 [{ id, name, sub?, desc, cost, build(input) }]
 *     languages,             [{ id, name }]
 *     code,                  { [mode]: { [lang]: [[lineKey, html], ...] } }
 *     draw(step, input),     the stage — the state the algorithm carries
 *     strip?(step, input),   the array strip card, when the input is a row
 *     answer?(step, input),  { html, note } for the answer card
 *     vars(step, input),     [[name, value], ...] — also drives hover-to-inspect
 *     hover?,                { [lang]: { identifier: varName } } extra aliases
 *     solutions?,            { [mode]: { desc, tag?, approach? } } part 3 captions;
 *                            approach = { idea, steps: [..], cost } is shown
 *                            under the mode cards for the chosen approach
 *     verification,          { [lang]: how it was checked, or { [mode]: … } } → part 3 badges
 *     caveats?,              { [mode]: { [lang]: note } } → under the code
 *     widget?(host),         part 1's interactive, mounted into #q-widget
 *   })
 *
 * Any reader-facing value may be a plain string or an { en, my } pair.
 *
 * A step generator returns every snapshot up front, not lazily — that is what
 * makes the scrubber possible. Reserved snapshot keys: `line` (the code line to
 * highlight), `note` (narration), `tag` (the phase chip). Everything else is the
 * lesson's own state, handed back to draw / strip / answer / vars.
 */

import { pick, onLangChange } from './i18n.js';
import { esc } from './kit.js';

const $ = (sel, el = document) => el.querySelector(sel);
const nameOf = (k) => (typeof k === 'string' ? k : k?.en ?? '');

/* A tab's selection attributes. Only the selected tab sits in the Tab order;
 * the arrow keys move between the rest (tabKeys below). */
const tabAttrs = (on) => `aria-selected="${on}" tabindex="${on ? 0 : -1}"`;
const selectTabs = (tabs, isOn) => tabs.forEach((b) => {
  const on = isOn(b);
  b.setAttribute('aria-selected', String(on));
  b.tabIndex = on ? 0 : -1;
  // a tab row that scrolls sideways (a narrow phone) shows its selected tab —
  // moving the row only, never the page
  const row = b.parentElement;
  if (on && row.scrollWidth > row.clientWidth) row.scrollLeft = b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2;
});

/* Arrow keys, Home and End inside a tablist: move to that tab and select it. */
function tabKeys(e) {
  const tab = e.target.closest('[role="tab"]');
  if (!tab || e.altKey || e.ctrlKey || e.metaKey) return;
  const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(tab);
  const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (j == null) return;
  e.preventDefault();
  const to = tabs[(j + tabs.length) % tabs.length];
  to.click();
  to.focus();
}

/* The code-language tabs: `mini` above the live code, plain above part 3. */
const langBar = (langs, active, cls = '') => `
      <div class="lang-bar${cls}" role="tablist">${langs.map((l) =>
        `<button class="lang" role="tab" data-lang="${l.id}" ${tabAttrs(l.id === active)}>${esc(l.name)}</button>`).join('')}
      </div>`;

/* Chrome owned by the engine rather than by any one lesson. */
const UI = {
  loadEx:    { en: 'load an example', my: 'ဥပမာ ထည့်ရန်' },
  array:     { en: 'The array', my: 'Array' },
  ready:     { en: 'ready', my: 'အသင့်' },
  back:      { en: '‹ Back', my: '‹ နောက်' },
  next:      { en: 'Next ›', my: 'ရှေ့ ›' },
  play:      { en: 'Play', my: 'ဖွင့်' },
  pause:     { en: 'Pause', my: 'ရပ်' },
  scrub:     { en: 'Scrub through steps', my: 'အဆင့်များကို ဆွဲကြည့်ရန်' },
  step:      { en: 'step', my: 'အဆင့်' },
  stepOf:    { en: 'Step {i} of {n}', my: 'အဆင့် {i} / {n}' },
  answer:    { en: 'answer', my: 'answer' },
  codeLive:  { en: 'The code, live', my: 'အလုပ်လုပ်နေသော code' },
  input:     { en: 'Input', my: 'Input' },
  output:    { en: 'Output', my: 'Output' },
  idea:      { en: 'Idea', my: 'စိတ်ကူး' },
  steps:     { en: 'Steps', my: 'အဆင့်များ' },
  cost:      { en: 'Cost', my: 'ကုန်ကျမှု' },
  secPick:   { en: 'Pick an approach', my: 'နည်းလမ်း ရွေးပါ' },
  secRun:    { en: 'Watch it run', my: 'အလုပ်လုပ်ပုံ ကြည့်ပါ' },
  load:      { en: 'Load into the stepper ↓', my: 'Stepper ထဲ ထည့်ရန် ↓' },
  copy:      { en: 'Copy', my: 'Copy' },
  copied:    { en: 'Copied', my: 'ကူးပြီး' },
  unset:     { en: 'not set yet at this step', my: 'ဤအဆင့်တွင် မသတ်မှတ်ရသေး' },
  valueNow:  { en: 'value at this step', my: 'ဤအဆင့်ရှိ တန်ဖိုး' },
  badInput:  { en: 'That input does not work here', my: 'ဤ input ကို အသုံးမပြုနိုင်ပါ' },
  stale:     { en: 'The walkthrough below still shows the last input that worked.', my: 'အောက်ပါ လမ်းညွှန်သည် နောက်ဆုံး အလုပ်လုပ်ခဲ့သော input ကိုသာ ပြနေဆဲ ဖြစ်သည်။' },
};

export function mountLesson(cfg) {
  // A lesson mounts itself on import. Setting this hook lets a checker collect
  // the config and skip everything that needs a DOM — scripts/check-lessons.mjs.
  if (globalThis.__LESSON_PROBE__) return globalThis.__LESSON_PROBE__(cfg);

  const root = document.getElementById('lesson');
  if (!root) throw new Error('mountLesson: no #lesson element');

  const langs = cfg.languages;
  const state = {
    mode: cfg.modes[0].id,
    lang: langs[0].id,
    i: 0,
    steps: [],
    timer: null,                               // set while playing
    input: structuredClone(cfg.input),
    varNames: [],
    open: null,                                // part 3 solutions shown open
  };

  /* ---------------- building ---------------- */

  const mode = () => cfg.modes.find((m) => m.id === state.mode);

  // `at` keeps the reader's place across a language change; an input or mode
  // change starts again at step 1.
  function rebuild(at = 0) {
    // the chosen approach in brief, under the mode cards; rebuild runs on every
    // mode switch, input change and language change
    const approach = $('[data-approach]', root);
    if (approach) approach.innerHTML = approachBlock(cfg.solutions?.[state.mode]?.approach, mode().cost);
    let steps;
    try {
      steps = mode().build(structuredClone(state.input)) || [];
      if (!badFields().length) showWarn('');
    } catch (err) {
      steps = [];
      showWarn(`${pick(UI.badInput)}: ${err.message}`);
    }
    state.steps = steps.length ? steps : [{ line: null, note: '' }];
    state.i = Math.max(0, Math.min(state.steps.length - 1, at));
    // Every identifier any step of this mode reports, so the code panel marks
    // a stable set and the tooltip can say "not set yet" rather than vanish.
    const names = new Set();
    if (cfg.vars) for (const s of state.steps) for (const [k] of cfg.vars(s, state.input) || []) names.add(nameOf(k));
    state.varNames = [...names];
    render();
  }

  /* ---------------- markup ---------------- */

  /* Part 2's interactive half, as two sub-sections: 2·1 the approach as a tab
   * with its explanation attached, then 2·2 one player card holding
   * everything the walkthrough needs, divided by rules rather than boxed
   * separately. (2·3, going deeper, is static and lives in Walkthrough.astro.) */
  function shell() {
    const fields = (cfg.controls || []).map((c) => `
      <div class="field">
        <label for="f-${c.key}">${esc(pick(c.label))}</label>
        <input type="${c.type || 'text'}" id="f-${c.key}" data-field="${c.key}"
               value="${esc(format(c, state.input[c.key]))}" spellcheck="false" autocomplete="off"
               ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''}>
      </div>`).join('');

    const presets = cfg.presets?.length ? `
      <div class="field">
        <label>${esc(pick(UI.loadEx))}</label>
        <div class="presets">${cfg.presets.map((p, i) =>
          `<button class="chip" data-preset="${i}">${esc(pick(p.label))}</button>`).join('')}</div>
      </div>` : '';

    const tabs = cfg.modes.map((m) => `
      <button class="atab" role="tab" data-mode="${m.id}" ${tabAttrs(m.id === state.mode)}>
        <span class="atab-name">${esc(pick(m.name))}${m.sub ? ` <span class="sub-name">&middot; ${esc(pick(m.sub))}</span>` : ''}</span>
        <span class="atab-desc">${esc(pick(m.desc ?? ''))}</span>
        <span class="atab-cost">${esc(pick(m.cost ?? ''))}</span>
      </button>`).join('');
    const head = (n, label) => `<div class="subsec-head"><span class="subsec-n">${n}</span><h3>${esc(pick(label))}</h3></div>`;
    return `
      <section class="subsec">
        ${head('2·1', UI.secPick)}
        <div class="atabs">
          <div class="atab-row" role="tablist" style="--modes:${cfg.modes.length}">${tabs}</div>
          <div class="atab-panel" role="tabpanel" data-approach></div>
        </div>
      </section>

      <section class="subsec" data-run>
        ${head('2·2', UI.secRun)}
        <div class="player">
          <div class="player-row controls">${fields}${presets}
            <p class="warn" id="f-warn" data-warn aria-live="polite" hidden></p>
          </div>
          ${cfg.strip ? `
          <div class="player-row">
            <div class="strip-head">
              <h4 class="as-h2">${esc(pick(cfg.stripLabel ?? UI.array))}</h4>
              <span class="op mono" data-op>${esc(pick(UI.ready))}</span>
            </div>
            <div class="strip" data-strip tabindex="0" role="region" aria-label="${esc(pick(cfg.stripLabel ?? UI.array))}"></div>
          </div>` : ''}
          <div class="player-row player-run">
            <div class="transport">
              <button class="btn" data-act="prev">${esc(pick(UI.back))}</button>
              <button class="btn primary" data-act="play">${esc(pick(UI.play))}</button>
              <button class="btn" data-act="next">${esc(pick(UI.next))}</button>
              <input type="range" data-scrub min="0" max="0" value="0" aria-label="${esc(pick(UI.scrub))}">
              <span class="counter" data-count>0 / 0</span>
            </div>
            <div class="narration" data-narration aria-live="polite" aria-atomic="true">
              <span class="tag" data-tag>${esc(pick(UI.step))}</span>
              <p class="text" data-note></p>
            </div>
          </div>
          <div class="player-row bench">
            <div class="col">
              <div class="panel" data-stage></div>
              ${cfg.answer ? `
              <div class="panel answer-card">
                <div class="strip-head">
                  <h4 class="as-h2">${esc(pick(UI.answer))}</h4>
                  <span class="note mono" data-ans-note></span>
                </div>
                <div class="answer-row" data-answer></div>
              </div>` : ''}
            </div>
            <div class="panel">
              <div class="panel-head">
                <h4 class="as-h2">${esc(pick(UI.codeLive))}</h4>
                <span class="note" data-code-label></span>
              </div>
              ${langBar(langs, state.lang, ' mini')}
              <div class="code" data-code tabindex="0" role="region" aria-label="${esc(pick(UI.codeLive))}"></div>
              <p class="code-sub" data-code-sub hidden></p>
            </div>
          </div>
        </div>
      </section>`;
  }

  function format(c, v) {
    if (c.format) return c.format(v);
    return Array.isArray(v) ? v.join(', ') : String(v ?? '');
  }

  // The page's keyboard hint, moved under the player on every paint.
  const hint = document.getElementById('play-hint');

  function paint() {
    root.innerHTML = shell();
    if (hint) $('[data-run]', root).append(hint);
    bindControls();
  }

  /* ---------------- drawing one step ---------------- */

  function render() {
    const s = state.steps[state.i];
    const m = mode();

    $('[data-stage]', root).innerHTML = cfg.draw(s, state.input) ?? '';
    if (cfg.strip) {
      $('[data-strip]', root).innerHTML = cfg.strip(s, state.input) ?? '';
      $('[data-op]', root).textContent = pick(s.tag) || pick(UI.ready);
    }
    if (cfg.answer) {
      const a = cfg.answer(s, state.input) || {};
      $('[data-answer]', root).innerHTML = a.html ?? '';
      $('[data-ans-note]', root).textContent = pick(a.note);
    }

    $('[data-tag]', root).textContent = pick(s.tag) || pick(UI.step);
    $('[data-note]', root).innerHTML = pick(s.note);

    renderCode(s, m);

    const scrub = $('[data-scrub]', root);
    scrub.max = String(state.steps.length - 1);
    scrub.value = String(state.i);
    // what a screen reader says for the scrubber: "Step 2 of 12: tally"
    const where = pick(UI.stepOf).replace('{i}', state.i + 1).replace('{n}', state.steps.length);
    scrub.setAttribute('aria-valuetext', pick(s.tag) ? `${where}: ${pick(s.tag)}` : where);
    $('[data-count]', root).textContent = `${state.i + 1} / ${state.steps.length}`;
    writeAddress();
  }

  function listing() {
    const byMode = cfg.code[state.mode] || {};
    return byMode[state.lang] || byMode[langs[0].id] || [];
  }

  function renderCode(s, m) {
    const box = $('[data-code]', root);
    const mark = varMarker(state.varNames, cfg.hover?.[state.lang] || {});
    box.innerHTML = listing().map(([key, html]) => {
      const hot = s.line != null && key === s.line ? ' hot' : '';
      return `<span class="ln${hot}">${mark(html || ' ')}</span>`;
    }).join('');

    const hot = $('.ln.hot', box);
    if (hot) box.scrollTop = Math.max(0, hot.offsetTop - box.clientHeight / 2 + hot.offsetHeight / 2);

    const langName = langs.find((l) => l.id === state.lang)?.name ?? state.lang;
    $('[data-code-label]', root).textContent = m.cost ? `${langName} · ${pick(m.cost)}` : langName;

    const cav = pick((cfg.caveats?.[state.mode] ?? {})[state.lang]);
    const sub = $('[data-code-sub]', root);
    sub.innerHTML = cav;
    sub.hidden = !cav;
  }

  /* ---------------- transport ---------------- */

  function go(i) {
    state.i = Math.max(0, Math.min(state.steps.length - 1, i));
    render();
  }
  // The narration is a live region, so a screen reader reads each step the
  // reader moves to. While playing it goes quiet — a step every 700 ms would
  // queue up faster than it can be read — and speaks again on stop.
  const narrate = (on) => $('[data-narration]', root)?.setAttribute('aria-live', on ? 'polite' : 'off');
  function stop() {
    clearInterval(state.timer);
    state.timer = null;
    const b = $('[data-act="play"]', root);
    if (b) b.textContent = pick(UI.play);
    narrate(true);
  }
  function play() {
    if (state.i >= state.steps.length - 1) state.i = 0;
    $('[data-act="play"]', root).textContent = pick(UI.pause);
    narrate(false);
    state.timer = setInterval(() => {
      if (state.i >= state.steps.length - 1) return stop();
      go(state.i + 1);
    }, 700);
  }
  // The transport buttons and their keys: prev, next, play/pause.
  function act(name) {
    if (name === 'play') return state.timer != null ? stop() : play();
    stop();
    go(state.i + (name === 'next' ? 1 : -1));
  }

  function setLangAll(id) {
    state.lang = id;
    selectTabs(document.querySelectorAll('[data-lang]'), (b) => b.dataset.lang === id);
    document.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== id; });
    render();
  }

  function loadInput(input) {
    stop();
    state.input = structuredClone(input);
    (cfg.controls || []).forEach((c) => {
      const el = $(`[data-field="${c.key}"]`, root);
      if (el) { el.value = format(c, state.input[c.key]); markBad(el, null); }
    });
    rebuild();
    syncStale();
  }

  /* A field whose text does not parse: marked on the field itself, tied to the
   * warning for a screen reader, and — while any field is bad — the player
   * dims to say it still shows the last input that worked. */
  const badFields = () => [...root.querySelectorAll('[data-field].bad')];
  function markBad(el, msg) {
    el.classList.toggle('bad', msg != null);
    if (msg != null) {
      el.dataset.err = msg;
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', 'f-warn');
    } else {
      delete el.dataset.err;
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }
  }
  function syncStale() {
    const bad = badFields();
    $('.player', root)?.classList.toggle('is-stale', bad.length > 0);
    if (bad.length) showWarn(`${bad[0].dataset.err} — ${pick(UI.stale)}`);
  }

  function showWarn(msg) {
    const w = $('[data-warn]', root);
    if (!w) return;
    w.textContent = msg;
    w.hidden = !msg;
  }

  function bindControls() {
    root.querySelectorAll('[data-field]').forEach((el) => {
      el.addEventListener('input', () => {
        const spec = cfg.controls.find((c) => c.key === el.dataset.field);
        try {
          state.input[spec.key] = spec.parse ? spec.parse(el.value) : el.value;
          markBad(el, null);
        } catch (err) {
          markBad(el, err.message);
          syncStale();
          return;
        }
        stop();
        rebuild();
        syncStale();
      });
    });
    const scrub = $('[data-scrub]', root);
    scrub.addEventListener('input', () => { stop(); go(Number(scrub.value)); });
  }

  root.addEventListener('click', (e) => {
    const card = e.target.closest('[data-mode]');
    if (card) {
      stop();
      state.mode = card.dataset.mode;
      selectTabs(root.querySelectorAll('[data-mode]'), (b) => b.dataset.mode === state.mode);
      showSolution(state, state.mode, true);
      rebuild();
      return;
    }
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) return setLangAll(langBtn.dataset.lang);
    const chip = e.target.closest('[data-preset]');
    if (chip) return loadInput(cfg.presets[Number(chip.dataset.preset)].input);
    const btn = e.target.closest('[data-act]');
    if (btn) act(btn.dataset.act);
  });

  // Arrow keys and space — never while someone is typing, and only while the
  // walkthrough is on screen, so a widget elsewhere keeps its own keys. A
  // modified key is the browser's (Alt+← is Back), a tab's arrows move between
  // tabs, and space on a focused control presses that control, not Play.
  root.addEventListener('keydown', tabKeys);
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (e.target.closest('#q-widget, [role="tab"]')) return;
    if (e.key === ' ' && e.target.closest('button, a[href], summary, [role="button"]')) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const name = { ArrowRight: 'next', ArrowLeft: 'prev', ' ': 'play' }[e.key];
    if (name) { e.preventDefault(); act(name); }
  });

  /* ---------------- the address ---------------- */

  // The reader's place — approach, step, code language and any input they
  // typed — lives in the query string, so a copied link reopens that exact
  // step: ?approach=heap&step=7&lang=python&nums=1,2,3. Values still at their
  // defaults are left out, so an untouched page keeps its plain address.
  const start = { mode: state.mode, lang: state.lang, input: structuredClone(cfg.input) };
  const fieldText = (c, input) => format(c, input[c.key]);

  function readAddress() {
    const q = new URLSearchParams(location.search);
    if (cfg.modes.some((m) => m.id === q.get('approach'))) state.mode = q.get('approach');
    if (langs.some((l) => l.id === q.get('lang'))) state.lang = q.get('lang');
    for (const c of cfg.controls || []) {
      if (!q.has(c.key)) continue;
      try { state.input[c.key] = c.parse ? c.parse(q.get(c.key)) : q.get(c.key); } catch { /* keep the default */ }
    }
    const step = Number(q.get('step'));
    state.i = Number.isInteger(step) && step > 0 ? step - 1 : 0;
    return ['approach', 'lang', 'step', ...(cfg.controls || []).map((c) => c.key)].some((k) => q.has(k));
  }

  // Readable in the address bar: commas, brackets and colons stay as typed.
  const enc = (v) => encodeURIComponent(v).replace(/%20/g, '+').replace(/%2C/g, ',').replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/%3A/g, ':');
  // "1, 2, 3" travels as "1,2,3" — but only when the field reads it back the
  // same, so a sentence like "A man, a plan" keeps its spaces.
  function compact(c, v) {
    const tight = v.replace(/,\s+/g, ',');
    if (tight === v || !c.parse) return v;
    try { return fieldText(c, { [c.key]: c.parse(tight) }) === v ? tight : v; } catch { return v; }
  }
  function query() {
    const q = [];
    if (state.mode !== start.mode) q.push(['approach', state.mode]);
    if (state.i > 0) q.push(['step', state.i + 1]);
    if (state.lang !== start.lang) q.push(['lang', state.lang]);
    for (const c of cfg.controls || []) {
      const v = fieldText(c, state.input);
      if (v !== fieldText(c, start.input)) q.push([c.key, compact(c, v)]);
    }
    return q.map(([k, v]) => `${k}=${enc(v)}`).join('&');
  }

  // Debounced: a scrubber drag paints dozens of steps a second, and Safari
  // throws once a page calls replaceState too often.
  let addressTimer = null;
  function writeAddress() {
    clearTimeout(addressTimer);
    addressTimer = setTimeout(() => {
      const q = query();
      const url = `${location.pathname}${q ? `?${q}` : ''}${location.hash}`;
      try { if (url !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', url); } catch { /* rate-limited */ }
      // "Report an issue" names the page with the same state, so a report
      // lands on the step it is about.
      const report = document.querySelector('.report a[href*="/issues/new"]');
      if (report) {
        const u = new URL(report.href);
        const page = new URL(u.searchParams.get('page'));
        page.search = q;
        u.searchParams.set('page', page.href);
        report.href = u.href;
      }
    }, 150);
  }

  /* ---------------- hover to inspect ---------------- */

  const tip = document.createElement('div');
  tip.className = 'var-tip';
  tip.hidden = true;
  document.body.appendChild(tip);
  let pinned = null;

  function showTip(el) {
    const s = state.steps[state.i];
    const name = el.dataset.c;
    const pair = (cfg.vars ? cfg.vars(s, state.input) : []).find(([k]) => nameOf(k) === name);
    const value = pair ? String(pair[1]) : null;
    tip.innerHTML = `<span class="tip-name">${esc(el.textContent)}</span>`
      + `<span class="tip-label">${esc(pick(UI.valueNow))}</span>`
      + `<span class="tip-val">${value == null ? esc(pick(UI.unset)) : esc(value)}</span>`;
    tip.hidden = false;
    const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left), innerWidth - tr.width - 8);
    let top = r.top - tr.height - 8;
    if (top < 4) top = r.bottom + 8;
    tip.style.left = `${Math.round(left + scrollX)}px`;
    tip.style.top = `${Math.round(top + scrollY)}px`;
  }
  const hideTip = () => { if (!pinned) tip.hidden = true; };

  root.addEventListener('mouseover', (e) => { const v = e.target.closest('.code .var'); if (v && !pinned) showTip(v); });
  root.addEventListener('mouseout', (e) => { if (e.target.closest('.code .var')) hideTip(); });
  root.addEventListener('click', (e) => {
    if (!e.target.closest('[data-code]')) return;
    const v = e.target.closest('.var');
    if (!v) { pinned = null; tip.hidden = true; return; }
    if (pinned === v) { pinned = null; tip.hidden = true; } else { pinned = null; showTip(v); pinned = v; }
  });
  document.addEventListener('scroll', () => { if (!pinned) tip.hidden = true; }, true);

  /* ---------------- part 1 and part 3 ---------------- */

  function paintAll() {
    paint();
    renderExamples(cfg, loadInput);
    renderSolutions(cfg, state);
    rebuild(state.i);
  }

  const shared = readAddress();
  paintAll();
  // Arriving from a shared link, not a reload or Back: open on the player.
  if (shared && !location.hash && performance.getEntriesByType('navigation')[0]?.type === 'navigate') {
    $('[data-run]', root)?.scrollIntoView({ block: 'start' });
  }
  if (cfg.widget) {
    const host = document.getElementById('q-widget');
    if (host) { cfg.widget(host); keepFocus(host); }
  }

  // Narration is generated per step and the chrome is rendered by this file, so
  // a language change redraws both — holding the mode, the language tab, the
  // reader's input and their place in the walkthrough.
  onLangChange(() => { stop(); paintAll(); });

  return { rebuild, go, stop, state };
}

/* A widget redraws its chips and cells on every pick, which throws away the
 * element that had focus and drops a keyboard reader back to the top of the
 * page. Registered after the widget's own handlers, so it runs after them: if
 * focus fell out of the widget, it goes to the redrawn element with the same
 * data-* attributes. A widget that already refocuses is left alone. */
function keepFocus(host) {
  let key = null;
  const before = () => {
    const el = document.activeElement;
    const attrs = el && el !== host && host.contains(el)
      ? el.getAttributeNames().filter((n) => n.startsWith('data-')) : [];
    key = attrs.length
      ? el.localName + attrs.map((n) => `[${n}="${CSS.escape(el.getAttribute(n))}"]`).join('') : null;
  };
  const after = () => {
    if (key && !host.contains(document.activeElement)) host.querySelector(key)?.focus();
  };
  for (const type of ['click', 'keydown']) {
    host.addEventListener(type, before, true);
    host.addEventListener(type, after);
  }
}

/* A function that wraps known identifiers in a rendered listing line, never
 * inside a tag and never in the middle of a longer identifier, so the reader
 * can hover one and see its value at the current step. Built once per listing. */
function varMarker(names, aliases) {
  const wanted = new Map(names.map((n) => [n, n]));
  for (const [ident, name] of Object.entries(aliases)) wanted.set(ident, name);
  const keys = [...wanted.keys()].filter(Boolean).sort((a, b) => b.length - a.length);
  if (!keys.length) return (lineHtml) => lineHtml;
  const pattern = new RegExp(`(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\@]/g, '\\$&')).join('|')})(?![A-Za-z0-9_])`, 'g');
  // A comment is prose about the code, not the code: "every word" in one
  // must not light up as the variable `word`. Comments are c() spans.
  return (lineHtml) => {
    let inComment = false;
    return lineHtml.split(/(<[^>]*>|&[a-z#0-9]+;)/i).map((part) => {
      if (part.startsWith('<')) {
        if (part === '<span class="c">') inComment = true;
        else if (part === '</span>') inComment = false;
        return part;
      }
      if (part.startsWith('&') || inComment) return part;
      return part.replace(pattern, (tok, _m, offset) => {
        if (/[A-Za-z0-9_.@$]/.test(part.charAt(offset - 1))) return tok;
        return `<span class="var" data-c="${esc(wanted.get(tok))}">${tok}</span>`;
      });
    }).join('');
  };
}

/* Part 1 — the worked examples, each loadable into the stepper. */
function renderExamples(cfg, loadInput) {
  const host = document.getElementById('examples');
  if (!host || !cfg.examples?.length) return;
  host.innerHTML = cfg.examples.map((ex, i) => `
    <div class="ex-card">
      <h3>${esc(pick(ex.title))}</h3>
      <p class="io"><b>${esc(pick(UI.input))}</b> ${pick(ex.inputHtml)}</p>
      <p class="io"><b>${esc(pick(UI.output))}</b> <code class="out">${esc(ex.output)}</code></p>
      ${ex.why ? `<ul class="why">${[].concat(ex.why).map((w) => `<li>${pick(w)}</li>`).join('')}</ul>` : ''}
      ${ex.load ? `<button class="btn ex-load" data-ex="${i}">${esc(pick(UI.load))}</button>` : ''}
    </div>`).join('');
  host.onclick = (e) => {
    const b = e.target.closest('[data-ex]');
    if (!b) return;
    loadInput(cfg.examples[Number(b.dataset.ex)].load);
    document.getElementById('part-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

/* Part 3 — the whole solution. Built from the same `code` the stepper
 * highlights, so the listing a reader copies cannot drift from the one they
 * watched run. */
/* The chosen approach in brief, under the mode cards: the idea in a sentence
 * or two, the steps as the code takes them, and the cost with its reason. */
function approachBlock(a, cost) {
  if (!a) return '';
  return `<div class="approach">
    <p><span class="approach-label">${esc(pick(UI.idea))}</span>${pick(a.idea)}</p>
    <div><span class="approach-label">${esc(pick(UI.steps))}</span>
      <ol>${a.steps.map((s) => `<li>${pick(s)}</li>`).join('')}</ol></div>
    <p><span class="approach-label">${esc(pick(UI.cost))}</span><span class="mono">${esc(pick(cost))}</span> — ${pick(a.cost)}</p>
  </div>`;
}

/* Part 3 opens on the approach the reader chose in 2·1; the others fold to
 * their heading, copyable still. Choosing another approach in 2·1 opens that
 * one too. A lesson with a single approach has nothing to fold. */
function showSolution(state, mode, open) {
  if (!state.open) return;
  if (open) state.open.add(mode); else state.open.delete(mode);
  document.querySelectorAll(`#solutions .src[data-src="${mode}"]`).forEach((src) => {
    src.querySelector('.src-toggle')?.setAttribute('aria-expanded', String(open));
    src.querySelector('pre.full').hidden = !open;
  });
}

function renderSolutions(cfg, state) {
  const host = document.getElementById('solutions');
  if (!host) return;
  const langs = cfg.languages;
  const activeLang = state.lang;
  const folds = cfg.modes.length > 1;
  state.open ??= new Set([state.mode]);

  // verification[lang] is one badge for every approach, or { [mode]: badge }
  // when one approach in that language behaves differently from the other.
  const badge = (lang, mode) => {
    const v = (cfg.verification || {})[lang];
    const how = pick(v && typeof v === 'object' && mode in v ? v[mode] : v);
    if (!how) return '';
    const unrun = /not compiled|not run|unverified|overflows/i.test(how);
    return `<span class="verify ${unrun ? 'warn' : 'ok'}">${esc(how)}</span>`;
  };

  host.innerHTML = `${langBar(langs, activeLang)}
    ${langs.map((l) => `
      <div class="lang-pane" data-pane="${l.id}" ${l.id === activeLang ? '' : 'hidden'}>
        ${cfg.modes.map((m) => {
          const meta = cfg.solutions?.[m.id] || {};
          const lines = (cfg.code[m.id]?.[l.id] || []).map(([, html]) => html).join('\n');
          const open = !folds || state.open.has(m.id);
          const id = `src-${l.id}-${m.id}`;
          const title = `${esc(pick(m.name))}${m.sub ? ` <span class="sub-name">&middot; ${esc(pick(m.sub))}</span>` : ''}${meta.tag ? `<span class="tagpill">${esc(meta.tag)}</span>` : ''}`;
          return `
          <div class="src" data-src="${m.id}">
            <div class="src-head">
              <h3 class="as-h2">${folds ? `<button class="src-toggle" aria-expanded="${open}" aria-controls="${id}"><span>${title}</span></button>` : title}</h3>
              ${badge(l.id, m.id)}
              <button class="btn copy" data-copy>${esc(pick(UI.copy))}</button>
              ${meta.desc ? `<p class="sub">${pick(meta.desc)}</p>` : `<p class="sub mono">${esc(pick(m.cost))}</p>`}
            </div>
            <pre class="full" id="${id}" tabindex="0"${open ? '' : ' hidden'}>${lines}</pre>
          </div>`;
        }).join('')}
      </div>`).join('')}`;

  host.onkeydown = tabKeys;
  host.onclick = (e) => {
    const langBtn = e.target.closest('[data-lang]');
    // the live code panel's tab switches every tab and pane on the page
    if (langBtn) return document.querySelector(`#lesson [data-lang="${langBtn.dataset.lang}"]`)?.click();
    const fold = e.target.closest('.src-toggle');
    if (fold) return showSolution(state, fold.closest('.src').dataset.src, fold.getAttribute('aria-expanded') !== 'true');
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const text = copy.closest('.src').querySelector('pre.full').textContent;
      navigator.clipboard?.writeText(text).then(() => {
        copy.textContent = pick(UI.copied);
        copy.classList.add('done');
        setTimeout(() => { copy.textContent = pick(UI.copy); copy.classList.remove('done'); }, 1400);
      });
    }
  };
}

