/** The right-hand progress rail, and the compact strip that replaces it on narrower screens. */
import { cards } from '../../lib/ai/flashcards'
import type { UnitRef } from '../../lib/ai/course'
import { crownCount, dailyGoal, dayXp, PACES, solvedCount, streak, today, totalXp, xpToday, type Progress, type SectionId } from '../../lib/progress'
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

const SECTION_COLOR: Record<SectionId, string> = { leetcode: 'var(--teal)', ai: 'var(--indigo)' }

/** Seven days of XP, stacked by section. */
function Week({ p }: { p: Progress }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = today(d)
    return { key, label: d.toLocaleDateString('en', { weekday: 'narrow' }), lc: dayXp(p, key, 'leetcode'), ai: dayXp(p, key, 'ai') }
  })
  const max = Math.max(dailyGoal(p), ...days.map((d) => d.lc + d.ai))
  const h = (n: number) => (n / max) * 70
  return (
    <div class="week" aria-label="XP over the last 7 days">
      {days.map((d, i) => (
        <div key={d.key} class={i === 6 ? 'today' : ''} title={`${d.lc + d.ai} XP (LeetCode ${d.lc}, AI Engineer ${d.ai})`}>
          <span class="stack-bar">
            {d.ai > 0 && <i style={{ height: `${h(d.ai)}px`, background: SECTION_COLOR.ai }} />}
            {d.lc > 0 && <i style={{ height: `${h(d.lc)}px`, background: SECTION_COLOR.leetcode }} />}
            {d.ai + d.lc === 0 && <i class="empty" />}
          </span>
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function Tile({ icon, color, n, label }: { icon: 'flame' | 'bolt' | 'crown' | 'check'; color: string; n: number; label: string }) {
  return (
    <div class="tile">
      <span class="ic" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
        <Icon name={icon} size={16} />
      </span>
      <b>{n}</b>
      <small>{label}</small>
    </div>
  )
}

function Goal({ p }: { p: Progress }) {
  const xp = xpToday(p)
  const g = dailyGoal(p)
  return (
    <div class="card">
      <div class="panel-title">
        <span class="kicker">Daily goal · {PACES[p.pace].label}</span>
        <span class="kicker">
          {xp}/{g} XP
        </span>
      </div>
      <div class="meter">
        <i style={{ width: `${Math.min((xp / g) * 100, 100)}%`, background: xp >= g ? 'var(--ok)' : 'var(--accent)' }} />
      </div>
      <small class="rail-note">
        {xp >= g ? 'Done for today. ' : ''}Counts XP from every section. <a href="/profile#plan">Change pace</a>
      </small>
    </div>
  )
}

/** `ai` shows the course's own stats and what's next; `site` (hub, profile) shows everything, by section. */
export default function Rail({ units, mode = 'ai' }: { units: UnitRef[]; mode?: 'ai' | 'site' }) {
  const p = useProgress()
  if (mode === 'site')
    return (
      <div class="stack" style={{ gap: '14px' }}>
        <div class="card">
          <div class="panel-title">
            <span class="kicker">All sections</span>
          </div>
          <div class="stat-tiles">
            <Tile icon="flame" color="var(--streak)" n={streak(p)} label="day streak" />
            <Tile icon="bolt" color="var(--xp)" n={totalXp(p)} label="total XP" />
            <Tile icon="check" color="var(--ok)" n={xpToday(p)} label="XP today" />
          </div>
          <div class="by-section">
            <a href="/leetcode" class="bs-row">
              <i style={{ background: SECTION_COLOR.leetcode }} />
              <b>LeetCode</b>
              <small>
                {totalXp(p, 'leetcode')} XP · {streak(p, 'leetcode')}-day streak · {solvedCount(p)} solved
              </small>
            </a>
            <a href="/ai-engineer" class="bs-row">
              <i style={{ background: SECTION_COLOR.ai }} />
              <b>AI Engineer</b>
              <small>
                {totalXp(p, 'ai')} XP · {streak(p, 'ai')}-day streak · {crownCount(p)} crowns
              </small>
            </a>
          </div>
        </div>
        <Goal p={p} />
        <div class="card">
          <div class="panel-title">
            <span class="kicker">This week</span>
            <span class="kicker legend">
              <i style={{ background: SECTION_COLOR.leetcode }} /> LeetCode <i style={{ background: SECTION_COLOR.ai }} /> AI
            </span>
          </div>
          <Week p={p} />
        </div>
      </div>
    )

  const next = nextUnit(p, units)
  const due = dueCount(p)
  return (
    <div class="stack" style={{ gap: '14px' }}>
      <div class="card">
        <div class="panel-title">
          <span class="kicker">AI Engineer</span>
          <span class="kicker">{xpToday(p, 'ai')} XP today</span>
        </div>
        <div class="stat-tiles">
          <Tile icon="flame" color="var(--streak)" n={streak(p, 'ai')} label="day streak" />
          <Tile icon="bolt" color="var(--xp)" n={totalXp(p, 'ai')} label="XP" />
          <Tile icon="crown" color="var(--accent)" n={crownCount(p)} label="crowns" />
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
      <Goal p={p} />
    </div>
  )
}

export function StatStrip() {
  const p = useProgress()
  return (
    <div class="stat-strip">
      <span class="s" style={{ color: 'var(--streak)' }} title="AI Engineer day streak">
        <Icon name="flame" size={16} /> <span style={{ color: 'var(--ink)' }}>{streak(p, 'ai')}</span>
      </span>
      <span class="s" style={{ color: 'var(--xp)' }} title="AI Engineer XP">
        <Icon name="bolt" size={16} /> <span style={{ color: 'var(--ink)' }}>{totalXp(p, 'ai')}</span>
      </span>
      <span class="s" style={{ color: 'var(--accent)' }} title="Modules crowned">
        <Icon name="crown" size={16} /> <span style={{ color: 'var(--ink)' }}>{crownCount(p)}</span>
      </span>
      <a class="s" href="/profile#plan" title="Daily goal (all sections)">
        {xpToday(p)}/{dailyGoal(p)} <small>XP today</small>
      </a>
    </div>
  )
}
