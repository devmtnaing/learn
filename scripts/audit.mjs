// npm run audit [-- <slug> ...]
//
// Drives every built solution page in a real browser and checks what only a
// browser can see. Run it after `npm run build`; it serves dist/ itself.
//
//   · every approach × language × step highlights a line of code
//   · every preset loads without a warning
//   · every input field accepts the text it shows, and rejects junk
//   · no page errors
//   · nothing wider than the screen at 400px, in both page languages, for
//     every approach and code language — and at 320px, a small phone
//   · headings never skip a level, on any step
//   · nothing waiting for a value shows a bare "·" or "—": answer slots,
//     empty-stage notes and ledgers say "?" or words (a dot in a stage cell
//     is notation, and allowed)
//   · keys: space on a focused button presses it rather than playing, and
//     an arrow on an approach tab moves between tabs rather than stepping
//   · a shared link reopens the same approach, step, code language and
//     input, and "Report an issue" carries it
//   · a toned row in a key/value table is actually coloured (a later CSS
//     rule once turned every highlighted row grey)
//   · the home page loads, lists every lesson, and fits at 400px
//   · site search: Ctrl+K opens it from a lesson with focus in the field, it
//     lists every lesson, "two sum" puts Two Sum first, Enter opens it, Esc
//     gives focus back, and the masthead stays one line at 320px
//   · axe-core finds no WCAG 2 A/AA violation (contrast, labels, keyboard
//     access) on any page, in the light and the dark theme, at the first
//     step and partway through
//
// Exits 1 on any finding. Needs Chromium: `npx playwright install chromium`.
import { createServer } from 'node:http';
import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const AXE = readFileSync(resolve(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');

/* WCAG 2 A and AA problems on the page as it stands, one line per rule. */
async function accessibility(page, where) {
  await page.addScriptTag({ content: AXE });
  const found = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }))
    .violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.length}× e.g. ${v.nodes[0].target.join(' ')}`));
  return found.map((x) => `a11y (${where}) ${x}`);
}

/* The top bar's search dialog (SiteSearch.astro), driven from a lesson. */
async function siteSearch(page, base, slugs) {
  const found = [];
  const open = () => page.$eval('#search-dlg', (d) => d.open);
  const first = () => page.$eval('#k-list .k-opt', (a) => a.getAttribute('href')).catch(() => null);
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto(`${base}/leetcode/${slugs[0]}`);
  await page.waitForSelector('#lesson .atab');
  await page.focus('#lesson [data-act="next"]');
  await page.keyboard.press('Control+k');
  if (!(await open())) return ['Ctrl+K did not open the search'];
  if (await page.evaluate(() => document.activeElement.getAttribute('role')) !== 'combobox') found.push('Ctrl+K: focus is not in the search field');
  await page.waitForSelector('#k-list .k-opt');
  const listed = await page.$$eval('#k-list .k-opt', (as) => as.map((a) => a.getAttribute('href')));
  found.push(...slugs.filter((s) => !listed.includes(`/leetcode/${s}`)).map((s) => `the empty search does not list /leetcode/${s}`));
  await page.keyboard.type('two sum');
  if (await first() !== '/leetcode/two-sum') found.push(`"two sum" puts ${await first()} first`);
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    found.push(...await accessibility(page, `search, ${scheme}`));
  }
  await page.emulateMedia({ colorScheme: 'light' });
  await page.keyboard.press('Escape');
  if (await open()) found.push('Esc did not close the search');
  else if (await page.evaluate(() => document.activeElement.dataset.act) !== 'next') found.push('closing the search did not give focus back');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('two sum');
  await page.waitForSelector('#k-list .k-opt');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/leetcode/two-sum', { timeout: 5000 }).catch(() => found.push('Enter on "two sum" did not open /leetcode/two-sum'));
  await page.setViewportSize({ width: 320, height: 700 });
  const bar = await page.$eval('.app-top', (m) => m.offsetHeight);
  if (bar > 60) found.push(`the top bar wraps at 320px (${bar}px tall)`);
  return found;
}

async function scrubTo(page, fraction) {
  await page.evaluate((f) => {
    const s = document.querySelector('#lesson [data-scrub]');
    s.value = String(Math.floor(Number(s.max) * f));
    s.dispatchEvent(new Event('input', { bubbles: true }));
  }, fraction);
}

const all = readdirSync(resolve(ROOT, 'src/lessons')).filter((d) => existsSync(resolve(ROOT, 'src/lessons', d, 'page.js'))).sort();
const only = process.argv.slice(2);
const slugs = only.length ? all.filter((s) => only.includes(s)) : all;
if (!existsSync(resolve(ROOT, 'dist/index.html'))) {
  console.error('no dist/ — run `npm run build` first');
  process.exit(1);
}

/* dist/ served as a static site: /x resolves to /x.html, else /x/index.html, the
 * order Cloudflare uses (/leetcode is leetcode.html beside the leetcode/ folder of
 * lessons). Its own server rather than `astro preview`, which runs one instance
 * per project. */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml' };
function serve() {
  const server = createServer((req, res) => {
    let file = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if (existsSync(`${file}.html`) && !(existsSync(file) && statSync(file).isFile())) file = `${file}.html`;   // build.format 'file'
    else if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/* Runs inside the page: step every frame of every approach × code language. */
async function stepEverything() {
  const wait = () => new Promise((r) => setTimeout(r, 0));
  const out = { frames: 0, noHot: [], presets: [], greyTone: [], fields: [], outline: new Map(), blank: new Map() };
  // One line per approach and problem, naming the first step it shows on.
  const once = (map, mode, i, what) => { if (!map.has(`${mode}: ${what}`)) map.set(`${mode}: ${what}`, i); };
  // Heading levels in page order may step down any amount, up only by one.
  const outline = (mode, i) => {
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => h.getClientRects().length);
    for (let j = 1; j < hs.length; j++) {
      const [a, b] = [+hs[j - 1].tagName[1], +hs[j].tagName[1]];
      if (b > a + 1) once(out.outline, mode, i, `h${a} "${hs[j - 1].textContent.trim().slice(0, 30)}" → h${b} "${hs[j].textContent.trim().slice(0, 30)}"`);
    }
  };
  // A spot waiting for a value whose own text is only a dot or dash.
  const PLACEHOLDER = /^[·•▪—–.…-]+$/;
  const blank = (mode, i) => {
    for (const el of document.querySelectorAll('#lesson [data-answer] *, #lesson .stage-empty, #lesson .ledger .expr, #lesson .ledger .total')) {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (PLACEHOLDER.test(own)) once(out.blank, mode, i, `"${own}" in .${[...el.classList].join('.') || el.tagName.toLowerCase()}`);
    }
  };
  const toneless = (el) => ![...el.classList].some((c) => c.startsWith('t-'));
  const plainRowBg = () => {
    const plain = [...document.querySelectorAll('#lesson .st-row:not(.head):not(.on)')].find(toneless);
    return plain ? getComputedStyle(plain).backgroundColor : null;
  };
  for (const mode of [...document.querySelectorAll('#lesson .atab')].map((b) => b.dataset.mode)) {
    document.querySelector(`#lesson .atab[data-mode="${mode}"]`).click(); await wait();
    for (const lang of [...document.querySelectorAll('#lesson .lang-bar.mini .lang')].map((b) => b.dataset.lang)) {
      document.querySelector(`#lesson .lang-bar.mini .lang[data-lang="${lang}"]`).click(); await wait();
      const scrub = document.querySelector('#lesson [data-scrub]');
      for (let i = 0; i <= Number(scrub.max); i++) {
        scrub.value = String(i); scrub.dispatchEvent(new Event('input', { bubbles: true })); await wait();
        out.frames++;
        if (!document.querySelector('#lesson .code .ln.hot')) out.noHot.push(`${mode}/${lang}/step ${i}`);
        const toned = document.querySelector('#lesson .st-row.t-up, #lesson .st-row.t-warn');
        const plain = plainRowBg();
        if (toned && plain && getComputedStyle(toned).backgroundColor === plain) out.greyTone.push(`${mode}/step ${i}`);
        outline(mode, i);
        blank(mode, i);
      }
    }
    // each field re-reads its own text without complaint, and flags garbage
    for (const el of document.querySelectorAll('#lesson [data-field]')) {
      const good = el.value;
      el.value = good; el.dispatchEvent(new Event('input', { bubbles: true })); await wait();
      const warn = document.querySelector('#lesson [data-warn]');
      if (el.classList.contains('bad')) out.fields.push(`${mode}: field ${el.dataset.field} rejects its own value "${good}": ${warn?.textContent}`);
      if (el.type !== 'number' && /^[-\d\s,\[\]null]*$/.test(good)) {   // number lists only: "@@" is a fine string
        el.value = '@@'; el.dispatchEvent(new Event('input', { bubbles: true })); await wait();
        if (!el.classList.contains('bad')) out.fields.push(`${mode}: field ${el.dataset.field} accepts "@@"`);
      }
      el.value = good; el.dispatchEvent(new Event('input', { bubbles: true })); await wait();
    }
    for (const chip of document.querySelectorAll('#lesson [data-preset]')) {
      chip.click(); await wait();
      const warn = document.querySelector('#lesson [data-warn]');
      if (warn && !warn.hidden) out.presets.push(`${mode}: "${chip.textContent.trim()}" → ${warn.textContent.trim()}`);
    }
  }
  const lines = (map) => [...map].map(([what, i]) => `${what} (from step ${i})`);
  return { ...out, outline: lines(out.outline), blank: lines(out.blank) };
}

/* Runs inside the page at a phone width: the widest the page gets, anywhere.
 * `everyLang` walks each code language too; at 320px one is enough, since the
 * page's width does not depend on which listing the code panel holds. */
async function widest(everyLang) {
  const wait = () => new Promise((r) => setTimeout(r, 15));
  const found = [];
  for (const mode of [...document.querySelectorAll('#lesson .atab')].map((b) => b.dataset.mode)) {
    document.querySelector(`#lesson .atab[data-mode="${mode}"]`).click(); await wait();
    const scrub = document.querySelector('#lesson [data-scrub]');
    const langs = [...document.querySelectorAll('#lesson .lang-bar.mini .lang')].map((b) => b.dataset.lang);
    for (const lang of everyLang ? langs : langs.slice(0, 1)) {
      document.querySelector(`#lesson .lang-bar.mini .lang[data-lang="${lang}"]`).click(); await wait();
      for (const ui of ['en', 'my']) {
        document.querySelector(`[data-lang-opt="${ui}"]`).click(); await wait();
        for (const i of [0, Math.floor(Number(scrub.max) / 2), Number(scrub.max)]) {
          scrub.value = String(i); scrub.dispatchEvent(new Event('input', { bubbles: true })); await wait();
          const over = document.documentElement.scrollWidth - window.innerWidth;
          if (over > 0) found.push(`${innerWidth}px ${mode}/${lang}/${ui}/step ${i}: ${over}px too wide`);
        }
      }
    }
  }
  document.querySelector('[data-lang-opt="en"]').click();
  return found;
}

/* Real key presses, then a shared link opened fresh. The page is English
 * (main's init script), so the play button reads "Play" when stopped. */
async function keysAndLink(page, url) {
  const found = [];
  await page.goto(url);
  await page.waitForSelector('#lesson .atab');
  await page.waitForTimeout(300);                       // the address is written after a 150ms debounce
  if (new URL(page.url()).search) found.push(`an untouched page has a query: ${new URL(page.url()).search}`);
  const count = () => page.$eval('#lesson [data-count]', (e) => e.textContent.trim());
  const playLabel = () => page.$eval('#lesson [data-act="play"]', (e) => e.textContent.trim());

  await page.focus('#lesson [data-act="next"]');
  await page.keyboard.press(' ');
  if (!(await count()).startsWith('2 /') || (await playLabel()) !== 'Play') {
    found.push(`space on a focused Next: step ${await count()}, play button "${await playLabel()}" (want step 2, not playing)`);
    // stop playback if space started it; clicking a stopped Play would start it
    if ((await playLabel()) !== 'Play') await page.click('#lesson [data-act="play"]').catch(() => {});
  }
  if ((await page.$$('#lesson .atab')).length > 1) {
    await page.focus('#lesson .atab[aria-selected="true"]');
    await page.keyboard.press('ArrowRight');
    const tab = await page.evaluate(() => {
      const t = [...document.querySelectorAll('#lesson .atab')];
      return [t.indexOf(document.activeElement), t.findIndex((x) => x.getAttribute('aria-selected') === 'true')];
    });
    if (tab[0] !== 1 || tab[1] !== 1) found.push(`→ on an approach tab: focus on tab ${tab[0]}, tab ${tab[1]} selected (want 1 and 1)`);
    if (!(await count()).startsWith('1 /')) found.push(`→ on an approach tab stepped the walkthrough: ${await count()}`);
  }

  // Change everything a link carries, then open the address in a fresh load.
  await page.evaluate(() => {
    document.querySelector('#lesson .lang-bar.mini .lang:last-child').click();
    document.querySelector('#lesson [data-preset]:last-child')?.click();
    for (let i = 0; i < 3; i++) document.querySelector('#lesson [data-act="next"]').click();
  });
  await page.waitForTimeout(300);                       // the address is written after a 150ms debounce
  const where = () => page.evaluate(() => ({
    mode: document.querySelector('#lesson .atab[aria-selected="true"]')?.dataset.mode,
    step: document.querySelector('#lesson [data-count]').textContent.trim(),
    lang: document.querySelector('#lesson .lang-bar.mini [aria-selected="true"]')?.dataset.lang,
    part3: document.querySelector('#solutions [data-pane]:not([hidden])')?.dataset.pane,
    fields: [...document.querySelectorAll('#lesson [data-field]')].map((e) => e.value),
  }));
  const before = await where();
  const link = page.url();
  const report = await page.evaluate(() => {
    const a = document.querySelector('.report a[href*="/issues/new"]');
    return a ? new URL(new URL(a.href).searchParams.get('page')).search : null;
  });
  if (report !== null && report !== new URL(link).search) found.push(`"Report an issue" names ${report || 'no state'}, the page is at ${new URL(link).search}`);
  await page.goto(link);
  await page.waitForSelector('#lesson .atab');
  const after = await where();
  for (const k of Object.keys(before)) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) found.push(`shared link ${new URL(link).search} reopens ${k} as ${JSON.stringify(after[k])}, not ${JSON.stringify(before[k])}`);
  }
  return found;
}

async function main() {
  const server = await serve();
  const BASE = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Every page starts in English, whatever the last one switched to.
  await page.addInitScript(() => { try { localStorage.setItem('learn-lang', 'en'); } catch {} });
  let failures = 0;
  const report = (slug, problems) => {
    if (!problems.length) { console.log(`ok   ${slug}`); return; }
    failures += problems.length;
    console.log(`FAIL ${slug}`);
    for (const p of problems.slice(0, 8)) console.log(`       ${p}`);
    if (problems.length > 8) console.log(`       … and ${problems.length - 8} more`);
  };

  for (const slug of slugs) {
    const errors = [];
    const onError = (e) => errors.push(`page error: ${e.message}`);
    page.on('pageerror', onError);
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.goto(`${BASE}/leetcode/${slug}`);
    await page.waitForSelector('#lesson .atab');
    const r = await page.evaluate(stepEverything);
    const a11y = [];
    for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(`${BASE}/leetcode/${slug}`);
      await page.waitForSelector('#lesson .atab');
      for (const f of [0, 0.35, 0.7, 1]) {
        await scrubTo(page, f);
        a11y.push(...await accessibility(page, `${scheme}, ${f === 0 ? 'first step' : f === 1 ? 'last step' : `${f * 100}% in`}`));
      }
    }
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 400, height: 850 });
    await page.waitForTimeout(100);
    const wide = await page.evaluate(widest, true);
    await page.setViewportSize({ width: 320, height: 700 });
    await page.waitForTimeout(100);
    wide.push(...await page.evaluate(widest, false));
    await page.setViewportSize({ width: 1300, height: 900 });
    const keys = await keysAndLink(page, `${BASE}/leetcode/${slug}`);
    page.off('pageerror', onError);
    report(`${slug} (${r.frames} frames)`, [
      ...errors,
      ...r.noHot.map((x) => `no highlighted line: ${x}`),
      ...r.presets.map((x) => `preset warns: ${x}`),
      ...r.fields,
      ...r.greyTone.map((x) => `toned table row renders grey: ${x}`),
      ...wide,
      ...r.outline.map((x) => `heading skips a level: ${x}`),
      ...r.blank.map((x) => `placeholder instead of words: ${x}`),
      ...keys,
      ...new Set(a11y),
    ]);
  }

  if (!only.length) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(`page error: ${e.message}`));
    await page.setViewportSize({ width: 400, height: 850 });
    await page.goto(`${BASE}/leetcode`);
    const home = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth - window.innerWidth,
      links: [...document.querySelectorAll('a.ptitle')].map((a) => a.getAttribute('href')),
    }));
    const missing = slugs.filter((s) => !home.links.includes(`/leetcode/${s}`));
    const a11y = [];
    for (const scheme of ['light', 'dark']) {
      await page.setViewportSize({ width: 1300, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(`${BASE}/leetcode`);
      a11y.push(...await accessibility(page, scheme));
    }
    const search = await siteSearch(page, BASE, slugs);
    report('problem list', [
      ...errors,
      ...search,
      ...(home.over > 0 ? [`${home.over}px too wide at 400px`] : []),
      ...missing.map((s) => `no link to /leetcode/${s}`),
      ...a11y,
    ]);

    // The hub and a sample of AI Engineer pages: no errors, nothing too wide,
    // AA in both themes. Lesson steps render client-side, so wait for them.
    const others = [
      ['/', 'h1'],
      ['/ai-engineer', '.track-tabs'],
      ['/ai-engineer/track-2', '.timeline'],
      ['/ai-engineer/track-2/2-7', '.guide-hero'],
      ['/ai-engineer/track-1/1-1/concepts', '.session-body h1'],
      ['/ai-engineer/track-1/1-4/learn', '.check'],
      ['/ai-engineer/track-2/2-7/quiz', '.option'],
      ['/ai-engineer/practice', '.grid-cards'],
      ['/ai-engineer/papers', '.check'],
      ['/ai-engineer/projects', 'details'],
      ['/profile', '.seg'],
    ];
    for (const [path, ready] of others) {
      const found = [];
      const onError = (e) => found.push(`page error: ${e.message}`);
      page.on('pageerror', onError);
      for (const width of [400, 320]) {
        await page.setViewportSize({ width, height: 850 });
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto(`${BASE}${path}`);
        await page.waitForSelector(ready, { timeout: 5000 }).catch(() => found.push(`${ready} never appeared`));
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 0) found.push(`${over}px too wide at ${width}px`);
      }
      for (const scheme of ['light', 'dark']) {
        await page.setViewportSize({ width: 1500, height: 900 });
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(`${BASE}${path}`);
        await page.waitForSelector(ready, { timeout: 5000 }).catch(() => {});
        found.push(...await accessibility(page, scheme));
      }
      page.off('pageerror', onError);
      report(path, [...new Set(found)]);
    }
  }

  await browser.close();
  server.close();
  console.log(failures ? `\nFAILED — ${failures} finding(s)` : `\npassed — ${slugs.length} page(s)`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
