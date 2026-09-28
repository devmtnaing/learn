/* The site search's index, built with the site: every problem in the home
 * page's order. The search dialog fetches it the first time it opens, so no
 * page carries the list in its HTML. */
import { groups, haystack, leetcodeUrl, PAGE } from '../data/catalog';

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
  return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' } });
}
