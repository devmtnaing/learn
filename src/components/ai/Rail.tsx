/** The right-hand progress rail, and the compact strip that replaces it on narrower screens. */
import { cards } from '../../lib/ai/flashcards'
import type { UnitRef } from '../../lib/ai/course'
import { crownCount, streak, today, totalXp, xpToday, type Progress } from '../../lib/progress'
import { Icon, startedModules, useProgress } from './ui'

export function nextUnit(p: Progress, units: UnitRef[]): UnitRef | null {
  const inTrack = units.filter((u) => u.track === p.aiTrack)
  return inTrack.find((u) => !p.done[u.id]) ?? units.find((u) => !p.done[u.id]) ?? null
}

export function dueCount(p: Progress) {
  const started = startedModules(p)
  const t = today()
  return cards.filter((c) => started.has(c.module) && (!p.cards[c.id] || p.cards[c.id].due <= t)).length
}

function Week({ p }: { p: Progress }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: today(d), label: d.toLocaleDateString('en', { weekday: 'narrow' }), xp: p.xpByDay[today(d)] || 0 }
  })
  const max = Math.max(p.dailyGoal, ...days.map((d) => d.xp))
  return (
    <div class="week" aria-label="XP over the last 7 days">
      {days.map((d, i) => (
        <div key={d.key} class={i === 6 ? 'today' : ''} title={`${d.xp} XP`}>
          <i style={{ height: `${Math.max((d.xp / max) * 70, 4)}px` }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Rail({ units }: { units: UnitRef[] }) {
  const p = useProgress()
  const next = nextUnit(p, units)
  const due = dueCount(p)
  const xp = xpToday(p)
  return (
    <div class="stack" style={{ gap: '14px' }}>
      <div class="card">
        <div class="panel-title">
          <span class="kicker">Today</span>
          <span class="kicker">
            {xp}/{p.dailyGoal} XP
          </span>
        </div>
        <div class="stat-tiles">
          <div class="tile">
            <span class="ic" style={{ background: 'color-mix(in srgb, var(--streak) 16%, transparent)', color: 'var(--streak)' }}>
              <Icon name="flame" size={16} />
            </span>
            <b>{streak(p)}</b>
            <small>day streak</small>
          </div>
          <div class="tile">
            <span class="ic" style={{ background: 'color-mix(in srgb, var(--xp) 18%, transparent)', color: 'var(--xp)' }}>
              <Icon name="bolt" size={16} />
            </span>
            <b>{totalXp(p)}</b>
            <small>total XP</small>
          </div>
          <div class="tile">
            <span class="ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Icon name="crown" size={16} />
            </span>
            <b>{crownCount(p)}</b>
            <small>crowns</small>
          </div>
        </div>
        <div class="meter" style={{ marginTop: '14px' }}>
          <i style={{ width: `${Math.min((xp / p.dailyGoal) * 100, 100)}%`, background: xp >= p.dailyGoal ? 'var(--ok)' : 'var(--accent)' }} />
        </div>
      </div>
      {next && (
        <a href={next.url} class={`card row upnext tc-${next.color}`}>
          <span class="chip-icon">
            <Icon name="play" fill="currentColor" size={16} />
          </span>
          <span class="grow">
            <span class="kicker">Up next · {next.label}</span>
            <b>{next.moduleTitle}</b>
            <small>
              {next.trackShort} · {next.moduleLabel}
            </small>
          </span>
          <Icon name="chevron" />
        </a>
      )}
      <a href="/ai-engineer/practice" class="card row">
        <span class="chip-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Icon name="refresh" />
        </span>
        <span class="grow">
          <b>Review cards</b>
          <small>{due} due now</small>
        </span>
        <Icon name="chevron" />
      </a>
      <div class="card">
        <div class="panel-title">
          <span class="kicker">This week</span>
          <span class="kicker">goal {p.dailyGoal}/day</span>
        </div>
        <Week p={p} />
      </div>
    </div>
  )
}

export function StatStrip() {
  const p = useProgress()
  return (
    <div class="stat-strip">
      <span class="s" style={{ color: 'var(--streak)' }}>
        <Icon name="flame" size={16} /> <span style={{ color: 'var(--ink)' }}>{streak(p)}</span>
      </span>
      <span class="s" style={{ color: 'var(--xp)' }}>
        <Icon name="bolt" size={16} /> <span style={{ color: 'var(--ink)' }}>{totalXp(p)}</span>
      </span>
      <span class="s" style={{ color: 'var(--accent)' }}>
        <Icon name="crown" size={16} /> <span style={{ color: 'var(--ink)' }}>{crownCount(p)}</span>
      </span>
      <span class="s">
        {xpToday(p)}/{p.dailyGoal} <small>XP today</small>
      </span>
    </div>
  )
}
