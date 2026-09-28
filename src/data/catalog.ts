/* The problem list, as the home page and site search both read it: every
 * problem in problems.json, in pattern order and then by difficulty, each with
 * the address of its solution page when a lesson covers it. */
import problems from './problems.json';

export interface Problem {
  id: number; title: string; slug: string; difficulty: 'Easy' | 'Medium' | 'Hard';
  paid: boolean; acRate: string; tags: string[]; category: string; extra?: boolean;
}

// A problem gets a solution page when a lesson folder names it: every
// lesson's page.js lists the LeetCode problems it covers.
const pages = import.meta.glob('../lessons/*/page.js', { eager: true, import: 'default' }) as
  Record<string, { links: { id: number }[] }>;
export const PAGE: Record<number, string> = {};
for (const [path, page] of Object.entries(pages)) {
  const slug = path.split('/').at(-2);
  for (const { id } of page.links) PAGE[id] = `/leetcode/${slug}`;
}

// The patterns, in the order they build on each other. Every problem in
// problems.json names one of these as its category.
export const CATEGORIES = [
  'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search',
  'Linked List', 'Trees', 'Tries', 'Heap', 'Backtracking', 'Graphs',
  'Dynamic Programming', 'Intervals', 'Math & Geometry', 'Bit Manipulation',
];
const LEVEL = { Easy: 0, Medium: 1, Hard: 2 };

export const all = Object.values(problems as Record<string, Problem[]>).flat();
for (const p of all) {
  if (!CATEGORIES.includes(p.category)) throw new Error(`problems.json: ${p.id} has unknown category "${p.category}"`);
}

export const groups = CATEGORIES.map((name) => ({
  name,
  id: name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-'),
  rows: all.filter((p) => p.category === name).sort((a, b) => LEVEL[a.difficulty] - LEVEL[b.difficulty]),
}));

/** What a search matches against: name, number, pattern and tags. */
export const haystack = (p: Problem) => [p.id, p.title, p.category, ...p.tags].join(' ').toLowerCase();

export const leetcodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;
