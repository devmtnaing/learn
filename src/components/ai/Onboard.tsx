/** The AI Engineer plan: asked once (pace, then where to start), then shown as a summary. */
import { useState } from 'preact/hooks'
import type { IconName } from '../../lib/icons'
import { formatWeeks, PACES, update, weeksAtPace } from '../../lib/progress'
import { PacePicker } from './Plan'
import { Icon, useProgress } from './ui'

export type TrackPlan = { id: string; url: string; short: string; title: string; color: string; weeks: number }

const STARTS: { id: string; icon: IconName; t: string; s: string }[] = [
  { id: 'setup', icon: 'code', t: 'Set up first', s: 'Python, PyTorch, GPU access and notes (week 0)' },
  { id: 't1', icon: 'bulb', t: 'New to building with LLMs', s: 'Start with Track 1: AI Application Engineer' },
  { id: 't2', icon: 'bolt', t: 'I already ship LLM apps', s: 'Jump to Track 2: ML / AI Systems Engineer' },
  { id: 't3', icon: 'sparkle', t: 'I already train models', s: 'Jump to Track 3: Research Engineer' },
]

export default function Onboard({ tracks }: { tracks: TrackPlan[] }) {
  const p = useProgress()
  const [step, setStep] = useState<1 | 2>(1)
  const track = tracks.find((t) => t.id === p.aiTrack) ?? tracks[1]

  if (p.aiOnboarded) {
    const all = tracks.filter((t) => t.id !== 'math' && t.id !== 'setup').reduce((a, t) => a + t.weeks, 0)
    return (
      <section class={`card plan-card tc-${track.color}`} aria-label="Your plan">
        <div class="plan-main">
          <div class="kicker">Your plan</div>
          <b class="plan-title">
            {PACES[p.pace].label} · {PACES[p.pace].hours} h a week
          </b>
          <small>
            You're on {track.short}: {track.title}, {formatWeeks(weeksAtPace(track.weeks, p.pace))} at this pace. All three tracks: {formatWeeks(weeksAtPace(all, p.pace))}. Estimates on every page follow your pace.
          </small>
        </div>
        <a class="btn ghost sm" href="/profile#plan">
          Change plan
        </a>
      </section>
    )
  }

  return (
    <section class="card onb-card" aria-labelledby="onb-h">
      <div class="kicker">Set up your plan · step {step} of 2</div>
      {step === 1 ? (
        <>
          <h2 id="onb-h" class="onb-h">
            How much time can you study?
          </h2>
          <p class="page-sub" style={{ margin: 0 }}>
            The course is written for about 13 hours a week. Pick yours and every estimate adjusts. You can change it any time in your profile.
          </p>
          <PacePicker value={p.pace} onPick={() => setStep(2)} />
        </>
      ) : (
        <>
          <h2 id="onb-h" class="onb-h">
            Where are you starting?
          </h2>
          <p class="page-sub" style={{ margin: 0 }}>
            {PACES[p.pace].label}, {PACES[p.pace].hours} h a week.{' '}
            <button type="button" class="linkish" onClick={() => setStep(1)}>
              Change
            </button>
          </p>
          <div class="choices">
            {STARTS.map((s) => {
              const t = tracks.find((x) => x.id === s.id)!
              return (
                <a key={s.id} href={t.url} class={`choice tc-${t.color}`} onClick={() => update((x) => ({ ...x, aiOnboarded: true, aiTrack: s.id }))}>
                  <span class="e">
                    <Icon name={s.icon} />
                  </span>
                  <span>
                    <b>{s.t}</b>
                    <small>
                      {s.s}
                      {t.weeks ? ` · ${formatWeeks(weeksAtPace(t.weeks, p.pace))}` : ''}
                    </small>
                  </span>
                </a>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
