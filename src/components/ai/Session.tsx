/** A full-screen lesson step: concepts, a resource or build checklist, a quiz, or the checkpoint. */
import type { ComponentChildren } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Question } from '../../lib/ai/quizzes'
import type { BuildItem, Resource, UnitKind } from '../../lib/ai/course'
import { addXp, markDone, toggleChecked, totalXp, touch, update, get } from '../../lib/progress'
import { Icon, shuffle, useProgress, XP } from './ui'

export type SessionModule = {
  id: string
  label: string
  title: string
  why: string
  concepts: string[]
  notes?: string
  guideHtml: string
  resources: Resource[]
  build: BuildItem[]
  checkpoint: string
}
export type SessionProps = {
  unitId: string
  kind: UnitKind
  module: SessionModule
  track: { id: string; short: string; subtitle: string }
  questions?: Question[]
  backUrl: string
  guideUrl: string
}

// ───────── shared frame ─────────

function useEnter(fn: () => void, enabled = true) {
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  useEffect(() => {
    if (!enabled) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLAnchorElement)) {
        e.preventDefault()
        ref.current()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [enabled])
}

function Frame({ progress, hearts, onClose, children, footer }: { progress: number; hearts?: number; onClose: () => void; children: ComponentChildren; footer: ComponentChildren }) {
  return (
    <div class="session">
      <div class="session-top">
        <button class="close" onClick={onClose} aria-label="Close and go back to the path">
          <Icon name="x" size={26} />
        </button>
        <div class="bar" role="progressbar" aria-label="Progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${Math.max(progress * 100, 2)}%` }} />
        </div>
        {hearts !== undefined && (
          <span class="hearts" aria-label={`${hearts} hearts left`}>
            <Icon name="heart" fill="currentColor" size={20} /> {hearts}
          </span>
        )}
      </div>
      <main class="session-body">{children}</main>
      {footer}
    </div>
  )
}

function Footer({ tone, msg, children, hints = true }: { tone?: 'ok' | 'bad'; msg?: ComponentChildren; children: ComponentChildren; hints?: boolean }) {
  return (
    <div class={`footer ${tone ?? ''}`}>
      <div class="footer-in">
        {msg ? (
          <div class="msg" role="status">
            {msg}
          </div>
        ) : hints ? (
          <div class="kbd">
            <kbd>Enter</kbd> continue · <kbd>1–4</kbd> choose
          </div>
        ) : (
          <span />
        )}
        <div style={{ display: 'flex', gap: '10px' }}>{children}</div>
      </div>
    </div>
  )
}

export function DoneScreen({ title, sub, xp, crown, onContinue }: { title: string; sub?: string; xp: number; crown?: boolean; onContinue: () => void }) {
  useEnter(onContinue)
  return (
    <Frame
      progress={1}
      onClose={onContinue}
      footer={
        <Footer>
          <button class="btn track" onClick={onContinue}>
            Continue
          </button>
        </Footer>
      }
    >
      <div class="done-screen">
        <div class="big" style={crown ? { background: 'color-mix(in srgb, var(--xp) 18%, transparent)', color: 'var(--xp)' } : undefined}>
          <Icon name={crown ? 'crown' : 'trophy'} size={60} />
        </div>
        <h1>{title}</h1>
        {sub && <p class="lead">{sub}</p>}
        <div class="xp-pills">
          <div class="xp-pill">
            <small>XP earned</small>
            <b>
              <span style={{ color: 'var(--xp)', display: 'inline-flex' }}>
                <Icon name="bolt" size={20} />
              </span>{' '}
              +{xp}
            </b>
          </div>
          {crown && (
            <div class="xp-pill">
              <small>Crown</small>
              <b style={{ color: 'var(--xp)' }}>
                <Icon name="crown" size={22} />
              </b>
            </div>
          )}
        </div>
      </div>
    </Frame>
  )
}

// ───────── unit types ─────────

type UnitProps = { s: SessionProps; exit: () => void; finish: (title: string, sub?: string, crown?: boolean) => void }

function Concepts({ s, exit, finish }: UnitProps) {
  const m = s.module
  const go = () => {
    markDone(s.unitId, XP.concepts)
    finish('Concepts unlocked', 'Next: work through the resources.')
  }
  useEnter(go)
  const fallback = !m.why && m.concepts.length === 0
  return (
    <Frame
      progress={0.5}
      onClose={exit}
      footer={
        <Footer>
          <button class="btn track" onClick={go}>
            Continue
          </button>
        </Footer>
      }
    >
      <span class="pill">
        <Icon name="sparkle" size={14} /> {s.track.short} · {m.label}
      </span>
      <h1>{m.title}</h1>
      {m.why && (
        <>
          <div class="section-title">Why it matters</div>
          <p class="lead" style={{ marginTop: 0 }} dangerouslySetInnerHTML={{ __html: m.why }} />
        </>
      )}
      {!m.why && !fallback && <p class="lead">{s.track.subtitle}</p>}
      {m.concepts.length > 0 && (
        <>
          <div class="section-title">Key concepts</div>
          <div class="concepts">
            {m.concepts.map((c, i) => (
              <span key={i} class="concept" dangerouslySetInnerHTML={{ __html: c }} />
            ))}
          </div>
        </>
      )}
      {m.notes && <ul class="prose" dangerouslySetInnerHTML={{ __html: m.notes }} />}
      {fallback && <div class="prose" dangerouslySetInnerHTML={{ __html: m.guideHtml }} />}
    </Frame>
  )
}

function Checklist({ s, exit, finish }: UnitProps) {
  const p = useProgress()
  const [showOpt, setShowOpt] = useState(false)
  const m = s.module
  const isRes = s.kind === 'resources'
  const required = isRes ? m.resources.filter((r) => r.core) : m.build
  const optional = isRes ? m.resources.filter((r) => !r.core) : []
  const req = required.length ? required : optional
  const doneN = req.filter((r) => p.checked[r.id]).length
  const complete = doneN === req.length
  const already = !!p.done[s.unitId]

  const go = () => {
    if (complete) {
      markDone(s.unitId, XP.unitBonus)
      if (!already) return finish(isRes ? 'Resources complete!' : 'Builds complete!')
    }
    exit()
  }
  useEnter(go)

  // The row toggles on click; the box is the real checkbox (keyboard and screen
  // readers), so the resource links inside the row are not nested in a control.
  const item = (r: { id: string; html: string; core?: boolean; sub?: string[] }, xp: number) => (
    <div
      key={r.id}
      class={`check ${p.checked[r.id] ? 'on' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a')) return
        toggleChecked(r.id, xp)
      }}
    >
      <button class="box" type="button" role="checkbox" aria-checked={!!p.checked[r.id]} aria-labelledby={`t-${r.id}`}>
        {p.checked[r.id] && <Icon name="check" size={16} />}
      </button>
      <span>
        {isRes && <span class="tag">{r.core ? 'Core' : 'Optional'}</span>}
        <span id={`t-${r.id}`} dangerouslySetInnerHTML={{ __html: r.html }} />
        {r.sub && r.sub.length > 0 && (
          <ol>
            {r.sub.map((x, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: x }} />
            ))}
          </ol>
        )}
      </span>
    </div>
  )

  return (
    <Frame
      progress={req.length ? doneN / req.length : 1}
      onClose={exit}
      footer={
        <Footer
          msg={
            <span style={{ fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '13px' }}>
              {doneN} / {req.length} {isRes ? 'core resources' : 'builds'} done
            </span>
          }
        >
          <button class={complete ? 'btn track' : 'btn ghost'} onClick={go}>
            {complete ? (already ? 'Done' : 'Complete') : 'Save & exit'}
          </button>
        </Footer>
      }
    >
      <span class="pill">
        <Icon name={isRes ? 'bookOpen' : 'code'} size={14} /> {isRes ? 'Learn' : 'Build'} · {m.label}
      </span>
      <h1>{m.title}</h1>
      <p class="lead" style={{ color: 'var(--muted)', fontSize: '15px' }}>
        {isRes
          ? 'Work through the core resources. Tick each one when finished. Links open in a new tab.'
          : 'Hands-on work. This is where the learning happens. Tick each build when it runs and you have written notes on it.'}
      </p>
      <div class="checklist">{req.map((r) => item(r, isRes ? XP.coreResource : XP.build))}</div>
      {required.length > 0 && optional.length > 0 && (
        <>
          <button class="optional-toggle" onClick={() => setShowOpt((v) => !v)} aria-expanded={showOpt}>
            <Icon name="chevron" size={16} /> {showOpt ? 'Hide' : 'Show'} {optional.length} optional resources
          </button>
          {showOpt && <div class="checklist">{optional.map((r) => item(r, XP.optionalResource))}</div>}
        </>
      )}
    </Frame>
  )
}

type QItem = { q: Question; order: number[]; first: boolean }

export function Quiz({ questions, title, exit, onComplete }: { questions: Question[]; title: string; exit: () => void; onComplete: (correctFirst: number, total: number) => void }) {
  const initial = useMemo<QItem[]>(() => shuffle(questions).map((q) => ({ q, order: shuffle(q.o.map((_, i) => i)), first: true })), [questions])
  const [queue, setQueue] = useState(initial)
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [status, setStatus] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [hearts, setHearts] = useState(3)
  const [correctFirst, setCorrectFirst] = useState(0)
  const [solved, setSolved] = useState(0)
  const [failed, setFailed] = useState(false)
  const item = queue[idx]
  const total = initial.length

  const check = () => {
    if (sel === null || status !== 'ask') return
    if (item.order[sel] === item.q.a) {
      setStatus('right')
      setSolved((n) => n + 1)
      if (item.first) {
        setCorrectFirst((n) => n + 1)
        addXp(XP.quizCorrect)
      }
    } else {
      setStatus('wrong')
      setHearts((h) => h - 1)
      setQueue((q) => [...q, { ...item, first: false, order: shuffle(item.q.o.map((_, i) => i)) }])
    }
  }
  const next = () => {
    if (status === 'wrong' && hearts <= 0) return setFailed(true)
    if (idx + 1 >= queue.length) return onComplete(correctFirst, total)
    setIdx(idx + 1)
    setSel(null)
    setStatus('ask')
  }
  useEnter(status === 'ask' ? check : next, !failed)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (status === 'ask' && n >= 1 && n <= (item?.order.length ?? 0)) setSel(n - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [status, item])

  if (failed)
    return (
      <Frame
        progress={solved / total}
        hearts={0}
        onClose={exit}
        footer={
          <Footer hints={false}>
            <button class="btn ghost" onClick={exit}>
              Back to path
            </button>
          </Footer>
        }
      >
        <div class="done-screen">
          <div class="big" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>
            <Icon name="heart" size={60} />
          </div>
          <h1>Out of hearts</h1>
          <p class="lead">Re-read the concepts and the guide for this module, then try again. Every miss shows you a gap worth knowing about.</p>
        </div>
      </Frame>
    )

  const correctIdx = item.order.indexOf(item.q.a)
  return (
    <Frame
      progress={solved / total}
      hearts={hearts}
      onClose={exit}
      footer={
        status === 'ask' ? (
          <Footer>
            <button class="btn track" disabled={sel === null} onClick={check}>
              Check
            </button>
          </Footer>
        ) : (
          <Footer
            tone={status === 'right' ? 'ok' : 'bad'}
            msg={
              <>
                <b>{status === 'right' ? 'Correct!' : `Answer: ${item.q.o[item.q.a]}`}</b>
                <span>{item.q.why}</span>
              </>
            }
          >
            <button class={status === 'right' ? 'btn ok' : 'btn red'} onClick={next}>
              Continue
            </button>
          </Footer>
        )
      }
    >
      <span class="pill">
        <Icon name="help" size={14} /> {title}
        {!item.first && ' · retry'}
      </span>
      <h1 style={{ fontSize: '22px', lineHeight: 1.35 }}>{item.q.q}</h1>
      <div class="options" role="radiogroup" aria-label="Answers">
        {item.order.map((oi, i) => {
          const cls = ['option', status === 'ask' && sel === i && 'sel', status !== 'ask' && i === correctIdx && 'right', status === 'wrong' && sel === i && 'wrong'].filter(Boolean).join(' ')
          return (
            <button key={i} class={cls} disabled={status !== 'ask'} onClick={() => setSel(i)} role="radio" aria-checked={sel === i}>
              <span class="k">{i + 1}</span>
              {item.q.o[oi]}
            </button>
          )
        })}
      </div>
    </Frame>
  )
}

function Checkpoint({ s, exit, finish }: UnitProps) {
  const p = useProgress()
  const m = s.module
  const openBuilds = m.build.filter((b) => !p.checked[b.id]).length
  const yes = () => {
    update((x) => ({ ...x, crowns: { ...x.crowns, [m.id]: true } }))
    markDone(s.unitId, XP.checkpoint)
    finish(`${m.title} mastered`, 'You earned a crown for this module.', true)
  }
  return (
    <Frame
      progress={0.9}
      onClose={exit}
      footer={
        <Footer hints={false}>
          <a class="btn ghost" href={s.guideUrl}>
            Not yet
          </a>
          <button class="btn track" onClick={yes}>
            Yes, I can
          </button>
        </Footer>
      }
    >
      <span class="pill">
        <Icon name="trophy" size={14} /> Checkpoint · {m.label}
      </span>
      <h1>{m.title}</h1>
      <div class="section-title">Can you do this without notes?</div>
      <div class="card" style={{ fontSize: '18px', lineHeight: 1.6, fontWeight: 500, padding: '22px 24px', borderLeft: '4px solid var(--c)', maxWidth: '80ch' }} dangerouslySetInnerHTML={{ __html: m.checkpoint }} />
      {openBuilds > 0 && (
        <p class="lead" style={{ fontSize: '14.5px', color: 'var(--muted)', marginTop: '16px' }}>
          {openBuilds} build {openBuilds === 1 ? 'exercise is' : 'exercises are'} still unticked for this module. Be honest with yourself: the checkpoint is what makes the next module easier.
        </p>
      )}
    </Frame>
  )
}

// ───────── entry ─────────

export default function Session(s: SessionProps) {
  const [startXp] = useState(() => totalXp(get()))
  const p = useProgress()
  const [finished, setFinished] = useState<null | { title: string; sub?: string; crown?: boolean }>(null)
  const exit = () => {
    location.href = s.backUrl
  }
  const finish = (title: string, sub?: string, crown?: boolean) => setFinished({ title, sub, crown })

  useEffect(() => {
    // opening a track's lesson makes it the track "up next" follows
    update((x) => (x.aiTrack === s.track.id ? x : { ...x, aiTrack: s.track.id }))
    touch('ai', { url: location.pathname, title: s.module.title, sub: `${s.track.short} · ${s.module.label}` })
  }, [s.track.id])

  if (finished) return <DoneScreen {...finished} xp={totalXp(p) - startXp} onContinue={exit} />

  switch (s.kind) {
    case 'concepts':
      return <Concepts s={s} exit={exit} finish={finish} />
    case 'resources':
    case 'build':
      return <Checklist s={s} exit={exit} finish={finish} />
    case 'quiz':
      return (
        <Quiz
          questions={s.questions ?? []}
          title={`Quiz · ${s.module.label}`}
          exit={exit}
          onComplete={(c, t) => {
            update((x) => ({ ...x, quizBest: { ...x.quizBest, [s.module.id]: Math.max(x.quizBest[s.module.id] || 0, c / t) } }))
            markDone(s.unitId, c === t ? XP.unitBonus : 0)
            finish(c === t ? 'Perfect quiz!' : 'Quiz complete', `${c} of ${t} right on the first try.`)
          }}
        />
      )
    case 'checkpoint':
      return <Checkpoint s={s} exit={exit} finish={finish} />
  }
}
