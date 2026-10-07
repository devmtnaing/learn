/* The site search's index, built with the site: every problem in the problem
 * list's order, then every AI Engineer module. The search dialog fetches it
 * the first time it opens, so no page carries the list in its HTML. */
import { groups, haystack, leetcodeUrl, PAGE } from '../data/catalog';
import { moduleUrl, tracks } from '../lib/ai/course';

export function GET() {
  const rows = groups.flatMap((g) => g.rows.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    // a solution page on this site, or the problem on LeetCode
    href: PAGE[p.id] ?? leetcodeUrl(p.slug),
    page: p.id in PAGE,
    text: haystack(p),
  })));
  const modules = tracks.flatMap((t) => t.modules.map((m) => ({
    id: m.label,
    title: m.title,
    difficulty: '',
    category: `AI Engineer · ${t.short}`,
    href: moduleUrl(t, m),
    page: true,
    kind: 'module',
    text: [m.label, m.title, t.short, t.title, 'ai engineer', ...m.concepts.map((c) => c.replace(/<[^>]+>/g, ''))].join(' ').toLowerCase(),
  })));
  return new Response(JSON.stringify([...rows, ...modules]), { headers: { 'content-type': 'application/json' } });
}
