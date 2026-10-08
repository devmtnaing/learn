/** Flashcards (Leitner boxes) and the entry to the mixed quiz review. */
import { useState } from 'preact/hooks'
import { cards as allCards, type Card } from '../../lib/ai/flashcards'
import { quizzes } from '../../lib/ai/quizzes'
import { reviewCard, today, type Progress } from '../../lib/progress'
import { Icon, shuffle, startedModules, useProgress } from './ui'

export const reviewPool = (p: Progress) =>
  Object.entries(quizzes)
    .filter(([mid]) => p.done[`${mid}/quiz`])
    .flatMap(([, qs]) => qs)

function FlashSession({ deck, titles, done }: { deck: Card[]; titles: Record<string, string>; done: () => void }) {
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const card = deck[i]
  const answer = (knew: boolean) => {
    reviewCard(card.id, knew)
    setFlip(false)
    if (i + 1 >= deck.length) done()
    else setI(i + 1)
  }
  return (
    <div class="card" style={{ padding: '20px' }}>
      <div class="row">
        <div class="bar">
          <i style={{ width: `${(i / deck.length) * 100}%` }} />
        </div>
        <small style={{ fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          {i + 1} / {deck.length}
        </small>
      </div>
      <div class="flash">
        <div
          class={`flash-in ${flip ? 'flip' : ''}`}
          onClick={() => setFlip((f) => !f)}
          role="button"
          tabIndex={0}
          aria-label={flip ? 'Show the term' : 'Reveal the meaning'}
          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), setFlip((f) => !f))}
        >
          <div class="face front" aria-hidden={flip}>
            <b>{card.front}</b>
            <span class="hint">tap to reveal</span>
          </div>
          <div class="face back" aria-hidden={!flip}>
            {card.back}
            <span class="hint">{titles[card.module]}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '22px' }}>
        {flip ? (
          <>
            <button class="btn ghost" onClick={() => answer(false)}>
              Again
            </button>
            <button class="btn" onClick={() => answer(true)}>
              Got it
            </button>
          </>
        ) : (
          <button class="btn" onClick={() => setFlip(true)}>
            Reveal
          </button>
        )}
      </div>
    </div>
  )
}

export default function Practice({ titles }: { titles: Record<string, string> }) {
  const p = useProgress()
  const [deck, setDeck] = useState<Card[] | null>(null)
  const started = startedModules(p)
  const unlocked = allCards.filter((c) => started.has(c.module))
  const t = today()
  const due = unlocked.filter((c) => !p.cards[c.id] || p.cards[c.id].due <= t)
  const pool = reviewPool(p)
  if (deck) return <FlashSession deck={deck} titles={titles} done={() => setDeck(null)} />
  return (
    <div class="stack">
      <div class="grid-cards">
        <div class="card row" style={{ padding: '18px' }}>
          <span class="chip-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Icon name="refresh" />
          </span>
          <span class="grow">
            <b>Flashcards</b>
            <small>
              {due.length} due · {unlocked.length} of {allCards.length} unlocked
            </small>
          </span>
          <button class="btn sm" disabled={!due.length} onClick={() => setDeck(shuffle(due).slice(0, 20))}>
            Review
          </button>
        </div>
        <div class="card row" style={{ padding: '18px' }}>
          <span class="chip-icon" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>
            <Icon name="help" />
          </span>
          <span class="grow">
            <b>Mixed quiz review</b>
            <small>{pool.length ? `8 random questions from ${pool.length} in finished quizzes` : 'Finish a module quiz to unlock'}</small>
          </span>
          {pool.length ? (
            <a class="btn sm" href="/ai-engineer/review">
              Start
            </a>
          ) : (
            <button class="btn sm" disabled>
              Start
            </button>
          )}
        </div>
      </div>
      {unlocked.length === 0 && (
        <p class="page-sub" style={{ marginTop: '8px' }}>
          Start your first module on the <a href="/ai-engineer">path</a> to unlock cards.
        </p>
      )}
    </div>
  )
}
