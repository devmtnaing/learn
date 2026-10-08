// Retakes the README screenshots in docs/screenshots/, in the dark theme at 2×.
// Run after `npm run build`; it serves dist/ itself, like the audit.
//
//   npm run screenshots
//
// The pages are given a little sample progress (some XP, a solved problem, a
// finished module) so the progress parts aren't empty. It lives only in the
// browser this script starts.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const OUT = resolve(ROOT, 'docs/screenshots');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

if (!existsSync(resolve(DIST, 'index.html'))) {
  console.error('no dist/ — run `npm run build` first');
  process.exit(1);
}

// /x is x.html, else x/index.html, as Cloudflare serves it
const server = createServer((req, res) => {
  let file = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(`${file}.html`) && !(existsSync(file) && statSync(file).isFile())) file = `${file}.html`;
  else if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}`;

const day = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
};
const SAMPLE = {
  pace: 'regular',
  aiOnboarded: true,
  aiTrack: 't1',
  xp: {
    leetcode: { [day(0)]: 20, [day(1)]: 40, [day(3)]: 20 },
    ai: { [day(0)]: 15, [day(1)]: 35, [day(2)]: 55, [day(4)]: 25 },
  },
  done: { 't1-1.1/concepts': true, 't1-1.1/resources': true, 't1-1.1/build': true, 't1-1.1/quiz': true, 't1-1.1/checkpoint': true, 't1-1.2/concepts': true },
  checked: { 'leetcode:two-sum': true, 'leetcode:valid-anagram': true },
  crowns: { 't1-1.1': true },
  quizBest: {},
  cards: {},
  recent: {
    leetcode: { url: '/leetcode/trapping-rain-water', title: 'Trapping Rain Water', sub: 'LeetCode 42 · Hard', at: Date.now() - 3600e3 },
    ai: { url: '/ai-engineer/track-1/1-2/concepts', title: 'Working with model APIs', sub: 'Track 1 · 1.2', at: Date.now() },
  },
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' });
await ctx.addInitScript((p) => localStorage.setItem('learn-progress-v1', p), JSON.stringify(SAMPLE));
const page = await ctx.newPage();

// scroll so part 2·2 ("Watch it run") sits under the top bar
const toPlayer = () => page.evaluate(() => {
  const n = [...document.querySelectorAll('.subsec-n')].find((e) => e.textContent.includes('2·2'));
  const el = n?.closest('section, div') ?? document.querySelector('#lesson');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 72);
});

async function shot(name, path, { width = 1440, height = 900, ready, before } = {}) {
  await page.setViewportSize({ width, height });
  await page.goto(BASE + path);
  if (ready) await page.waitForSelector(ready);
  if (before) await before();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(OUT, `${name}.png`) });
  console.log(`  ${name}.png  ${path}`);
}

await shot('home', '/', { ready: '.jbi' });
await shot('problems', '/leetcode', { ready: '.prow' });
await shot('question', '/leetcode/two-sum', { ready: '#lesson .atab' });
await shot('walkthrough', '/leetcode/lowest-common-ancestor-of-a-binary-tree?step=4', {
  width: 1280,
  height: 1000,
  ready: '#lesson .atab',
  before: toPlayer,
});
await shot('burmese', '/leetcode/trapping-rain-water?approach=pointers', {
  width: 1280,
  height: 1000,
  ready: '#lesson .atab',
  before: async () => {
    await page.click('[data-lang-opt="my"]');
    await page.evaluate(() => {
      const s = document.querySelector('#lesson [data-scrub]');
      s.value = s.max;
      s.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await toPlayer();
  },
});
await shot('ai-path', '/ai-engineer/track-1', { ready: '.timeline' });
await shot('ai-quiz', '/ai-engineer/track-1/1-4/quiz', {
  ready: '.option',
  before: async () => {
    await page.click('.option:has-text("Keyword search")');
    await page.click('.footer .btn');
  },
});

await browser.close();
server.close();
