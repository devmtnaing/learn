/** The hub's "jump back in": one card per section you have used, most recent first. */
import type { UnitRef } from '../../lib/ai/course'
import { nextUnit } from './Rail'
import { Icon, useProgress } from './ui'

type Card = { key: string; color: string; kicker: string; title: string; sub: string; href: string; cta: string; other: { href: string; label: string }; at: number }

export default function JumpBackIn({ units }: { units: UnitRef[] }) {
  const p = useProgress()
  const cards: Card[] = []
  const lc = p.recent.leetcode
  if (lc)
    cards.push({
      key: 'leetcode',
      color: 'teal',
      kicker: 'LeetCode · last opened',
      title: lc.title,
      sub: lc.sub,
      href: lc.url,
      cta: 'Open problem',
      other: { href: '/leetcode', label: 'All problems' },
      at: lc.at,
    })
  const aiUsed = p.recent.ai || p.aiOnboarded || Object.keys(p.done).length > 0
  const next = aiUsed ? nextUnit(p, units) : null
  if (next)
    cards.push({
      key: 'ai',
      color: 'indigo',
      kicker: 'AI Engineer · up next',
      title: next.moduleTitle,
      sub: `${next.trackShort} · ${next.moduleLabel} · ${next.label}`,
      href: next.url,
      cta: 'Continue',
      other: { href: '/ai-engineer', label: 'Overview' },
      at: p.recent.ai?.at ?? 0,
    })
  if (!cards.length) return null
  cards.sort((a, b) => b.at - a.at)
  return (
    <section aria-labelledby="jbi-h" style={{ marginBottom: '28px' }}>
      <h2 id="jbi-h" class="section-title" style={{ marginTop: 0 }}>
        Jump back in
      </h2>
      <div class="grid-cards">
        {cards.map((c) => (
          <div key={c.key} class={`card jbi tc-${c.color}`}>
            <div class="kicker" style={{ color: 'var(--ct)' }}>
              {c.kicker}
            </div>
            <b class="jbi-title">{c.title}</b>
            <small class="jbi-sub">{c.sub}</small>
            <div class="row" style={{ marginTop: '12px', gap: '10px' }}>
              <a class="btn track sm" href={c.href}>
                <Icon name="play" size={13} fill="currentColor" /> {c.cta}
              </a>
              <a class="jbi-other" href={c.other.href}>
                {c.other.label}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
