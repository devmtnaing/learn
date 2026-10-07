/* The site's sections and each one's own navigation. The section rail lists
 * the sections; the section sidebar shows only the current one's nav, so a
 * new course adds one entry here instead of lengthening a shared menu. */
import type { IconName } from '../lib/icons';
import { all, groups } from './catalog';
import { tracks, trackUrl, units } from '../lib/ai/course';

export type SectionId = 'leetcode' | 'ai';
export type NavItem = {
  href: string;
  label: string;
  /** small text before the label, e.g. "Track 1" */
  kicker?: string;
  icon?: IconName;
  count?: number;
  /** track colour for the dot and progress meter */
  color?: string;
  /** unit ids whose share done fills the meter (painted by the AI section's script) */
  meterOf?: string;
  /** match this path and everything under it, not only the exact path */
  prefix?: boolean;
};
export type Section = {
  id: SectionId;
  label: string;
  tagline: string;
  href: string;
  icon: IconName;
  accent: 'teal' | 'indigo';
  groups: { label?: string; items: NavItem[] }[];
};

export const SECTIONS: Section[] = [
  {
    id: 'leetcode',
    label: 'LeetCode',
    tagline: 'Step through solutions',
    href: '/leetcode',
    icon: 'code',
    accent: 'teal',
    groups: [
      { items: [{ href: '/leetcode', label: 'All problems', icon: 'grid', count: all.length }] },
      { label: 'Patterns', items: groups.map((g) => ({ href: `/leetcode#${g.id}`, label: g.name, count: g.rows.length })) },
    ],
  },
  {
    id: 'ai',
    label: 'AI Engineer',
    tagline: 'Backend → research',
    href: '/ai-engineer',
    icon: 'sparkle',
    accent: 'indigo',
    groups: [
      { items: [{ href: '/ai-engineer', label: 'Overview', icon: 'route' }] },
      {
        label: 'Tracks',
        items: tracks.map((t) => ({
          href: trackUrl(t),
          label: t.title,
          kicker: t.short,
          color: t.color,
          prefix: true,
          meterOf: units.filter((u) => u.track === t.id).map((u) => u.id).join(','),
        })),
      },
      {
        label: 'Practice',
        items: [
          { href: '/ai-engineer/practice', label: 'Flashcards & review', icon: 'refresh' },
          { href: '/ai-engineer/papers', label: 'Papers', icon: 'file' },
          { href: '/ai-engineer/projects', label: 'Projects', icon: 'hammer' },
        ],
      },
    ],
  },
];

export const sectionOf = (id: string) => SECTIONS.find((s) => s.id === id);
