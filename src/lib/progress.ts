// Progress for the whole site, kept in localStorage. Every section reads and
// writes it through here, so XP, streak and daily goal are shared. A signed-in
// sync to the server will replace load/save below; nothing else needs to change.
//
// Item ids are namespaced by their section: AI Engineer units look like
// "t2-2.7/quiz", papers "paper:<id>", projects "project:<id>".

export type CardState = { box: number; due: string }
/** The last thing opened in a section, for "jump back in" on the hub. */
export type Recent = { url: string; title: string; sub: string; at: number }
export type Progress = {
  dailyGoal: number
  /** Whether the AI Engineer "where are you starting?" question was answered. */
  aiOnboarded: boolean
  aiTrack: string
  xpByDay: Record<string, number>
  done: Record<string, true>
  checked: Record<string, true>
  crowns: Record<string, true>
  quizBest: Record<string, number>
  cards: Record<string, CardState>
  /** keyed by section id: 'leetcode', 'ai' */
  recent: Record<string, Recent>
}

const KEY = 'learn-progress-v1'
const EMPTY: Progress = {
  dailyGoal: 30,
  aiOnboarded: false,
  aiTrack: 't1',
  xpByDay: {},
  done: {},
  checked: {},
  crowns: {},
  quizBest: {},
  cards: {},
  recent: {},
}

function load(): Progress {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return { ...EMPTY, ...JSON.parse(s) }
  } catch {
    /* storage unavailable: run in memory */
  }
  return { ...EMPTY }
}

let state: Progress | null = null
const listeners = new Set<() => void>()

export function get(): Progress {
  if (!state) state = load()
  return state
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function update(fn: (p: Progress) => Progress) {
  state = fn(get())
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

// another tab changed it
if (typeof window !== 'undefined')
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    listeners.forEach((l) => l())
  })

export const today = (d = new Date()) => d.toLocaleDateString('en-CA')

export function addXp(n: number) {
  if (n <= 0) return
  const t = today()
  update((p) => ({ ...p, xpByDay: { ...p.xpByDay, [t]: (p.xpByDay[t] || 0) + n } }))
}

export const totalXp = (p: Progress) => Object.values(p.xpByDay).reduce((a, b) => a + b, 0)
export const xpToday = (p: Progress) => p.xpByDay[today()] || 0
export const crownCount = (p: Progress) => Object.keys(p.crowns).length

export function streak(p: Progress) {
  let n = 0
  const d = new Date()
  if (!p.xpByDay[today(d)]) d.setDate(d.getDate() - 1)
  while (p.xpByDay[today(d)]) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export function toggleChecked(id: string, xp: number) {
  const on = !get().checked[id]
  update((p) => {
    const checked = { ...p.checked }
    if (on) checked[id] = true
    else delete checked[id]
    return { ...p, checked }
  })
  if (on) addXp(xp)
  return on
}

export function markDone(unitId: string, xp = 0) {
  const first = !get().done[unitId]
  update((p) => ({ ...p, done: { ...p.done, [unitId]: true } }))
  if (first) addXp(xp)
}

/** Remember the last thing opened in a section. */
export function touch(section: string, item: Omit<Recent, 'at'>) {
  update((p) => ({ ...p, recent: { ...p.recent, [section]: { ...item, at: Date.now() } } }))
}

export const exportProgress = () => JSON.stringify(get(), null, 2)

export function importProgress(json: string) {
  const parsed = JSON.parse(json)
  if (typeof parsed !== 'object' || !parsed || !parsed.xpByDay) throw new Error('Not a progress file')
  // files exported by the first standalone AI Engineer site used these names
  if ('startTrack' in parsed && !('aiTrack' in parsed)) parsed.aiTrack = parsed.startTrack
  if ('onboarded' in parsed && !('aiOnboarded' in parsed)) parsed.aiOnboarded = parsed.onboarded
  update(() => ({ ...EMPTY, ...parsed }))
}

export const resetProgress = () => update(() => ({ ...EMPTY }))

// Leitner boxes: review intervals in days per box.
const INTERVALS = [0, 1, 3, 7, 16, 35]
export function reviewCard(id: string, knew: boolean) {
  update((p) => {
    const cur = p.cards[id] || { box: 0, due: today() }
    const box = knew ? Math.min(cur.box + 1, INTERVALS.length - 1) : 1
    const d = new Date()
    d.setDate(d.getDate() + INTERVALS[box])
    return { ...p, cards: { ...p.cards, [id]: { box, due: today(d) } } }
  })
  addXp(knew ? 2 : 1)
}
