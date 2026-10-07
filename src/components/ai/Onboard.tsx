/** "Where are you starting?" on the AI Engineer overview, until it has been answered once. */
import { useState } from 'preact/hooks'
import type { IconName } from '../../lib/icons'
import { update } from '../../lib/progress'
import { Icon, useProgress } from './ui'

const STARTS: { id: string; url: string; color: string; icon: IconName; t: string; s: string }[] = [
  { id: 'setup', url: '/ai-engineer/setup', color: 'slate', icon: 'code', t: 'Set up first', s: 'Python, PyTorch, GPU access and notes (week 0)' },
  { id: 't1', url: '/ai-engineer/track-1', color: 'teal', icon: 'bulb', t: 'New to building with LLMs', s: 'Start with Track 1: AI Application Engineer' },
  { id: 't2', url: '/ai-engineer/track-2', color: 'indigo', icon: 'bolt', t: 'I already ship LLM apps', s: 'Jump to Track 2: ML / AI Systems Engineer' },
  { id: 't3', url: '/ai-engineer/track-3', color: 'rose', icon: 'sparkle', t: 'I already train models', s: 'Jump to Track 3: Research Engineer' },
]

export default function Onboard() {
  const p = useProgress()
  const [goal, setGoal] = useState(p.dailyGoal)
  if (p.aiOnboarded) return null
  return (
    <section class="card onb-card" aria-labelledby="onb-h">
      <div class="kicker">Welcome</div>
      <h2 id="onb-h" style={{ fontSize: '22px', margin: '6px 0 4px' }}>
        Where are you starting?
      </h2>
      <p class="page-sub" style={{ margin: 0 }}>
        Pick a daily goal, then a starting point. You can change both later on your profile.
      </p>
      <div class="seg" role="group" aria-label="Daily goal" style={{ marginTop: '14px' }}>
        {[
          [10, 'Casual'],
          [30, 'Regular'],
          [50, 'Serious'],
          [100, 'Intense'],
        ].map(([xp, l]) => (
          <button key={xp} class={goal === xp ? 'on' : ''} aria-pressed={goal === xp} onClick={() => setGoal(xp as number)}>
            {l} · {xp} XP/day
          </button>
        ))}
      </div>
      <div class="choices">
        {STARTS.map((s) => (
          <a
            key={s.id}
            href={s.url}
            class={`choice tc-${s.color}`}
            onClick={() => update((x) => ({ ...x, aiOnboarded: true, aiTrack: s.id, dailyGoal: goal }))}
          >
            <span class="e">
              <Icon name={s.icon} />
            </span>
            <span>
              <b>{s.t}</b>
              <small>{s.s}</small>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
