// Progress for the whole site, kept in localStorage. Every section reads and
// writes it through here. XP is recorded per section, so each section can show
// its own streak and total while the hub and the daily goal count all of it.
// A signed-in sync to the server will replace load/save below; nothing else
// needs to change.
//
// Item ids are namespaced by their section: AI Engineer units look like
// "t2-2.7/quiz", papers "paper:<id>", projects "project:<id>", LeetCode
// problems marked solved "leetcode:<slug>".

export type SectionId = 'leetcode' | 'ai'
export const SECTION_LABEL: Record<SectionId, string> = { leetcode: 'LeetCode', ai: 'AI Engineer' }

/** How much time you plan to study. The course is written for ~13.5 hours a week. */
export type Pace = 'casual' | 'regular' | 'serious' | 'intense'
export const PACES: Record<Pace, { label: string; hours: number; xp: number }> = {
  casual: { label: 'Casual', hours: 3, xp: 10 },
  regular: { label: 'Regular', hours: 6, xp: 30 },
  serious: { label: 'Serious', hours: 12, xp: 50 },
  intense: { label: 'Intense', hours: 25, xp: 100 },
}
export const COURSE_HOURS_PER_WEEK = 13.5

export type CardState = { box: number; due: string }
/** The last thing opened in a section, for "jump back in" on the hub. */
export type Recent = { url: string; title: string; sub: string; at: number }
export type Progress = {
  pace: Pace
  /** Whether the AI Engineer plan (pace and starting track) has been chosen. */
  aiOnboarded: boolean
  aiTrack: string
  /** XP earned, per section, per day (YYYY-MM-DD). */
  xp: Partial<Record<SectionId, Record<string, number>>>
  done: Record<string, true>
  checked: Record<string, true>
  crowns: Record<string, true>
  quizBest: Record<string, number>
  cards: Record<string, CardState>
  recent: Partial<Record<SectionId, Recent>>
}

const KEY = 'learn-progress-v1'
const EMPTY: Progress = {
  pace: 'regular',
  aiOnboarded: false,
  aiTrack: 't1',
  xp: {},
  done: {},
  checked: {},
  crowns: {},
  quizBest: {},
  cards: {},
  recent: {},
}

const paceFromGoal = (goal: number): Pace => (goal <= 10 ? 'casual' : goal <= 30 ? 'regular' : goal <= 50 ? 'serious' : 'intense')

/** Older saves and exports: one XP-per-day map (all AI Engineer), a daily XP goal, other key names. */
function migrate(raw: Record<string, unknown>): Progress {
  const r = { ...raw } as Record<string, any>
  if (r.xpByDay && !r.xp) r.xp = { ai: r.xpByDay }
  if (typeof r.dailyGoal === 'number' && !r.pace) r.pace = paceFromGoal(r.dailyGoal)
  if ('startTrack' in r && !('aiTrack' in r)) r.aiTrack = r.startTrack
  if ('onboarded' in r && !('aiOnboarded' in r)) r.aiOnboarded = r.onboarded
  delete r.xpByDay
  delete r.dailyGoal
  delete r.startTrack
  delete r.onboarded
  return { ...EMPTY, ...r }
}

function load(): Progress {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return migrate(JSON.parse(s))
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

// ───────── XP, streaks, goal ─────────

export function addXp(n: number, section: SectionId = 'ai') {
  if (n <= 0) return
  const t = today()
  update((p) => {
    const days = { ...(p.xp[section] ?? {}) }
    days[t] = (days[t] || 0) + n
    return { ...p, xp: { ...p.xp, [section]: days } }
  })
}

/** XP on one day, for one section or (no section) all of them. */
export function dayXp(p: Progress, day: string, section?: SectionId) {
  const maps = section ? [p.xp[section] ?? {}] : Object.values(p.xp)
  return maps.reduce((a, m) => a + (m?.[day] || 0), 0)
}
export function totalXp(p: Progress, section?: SectionId) {
  const maps = section ? [p.xp[section] ?? {}] : Object.values(p.xp)
  return maps.reduce((a, m) => a + Object.values(m ?? {}).reduce((x, y) => x + y, 0), 0)
}
export const xpToday = (p: Progress, section?: SectionId) => dayXp(p, today(), section)

/** Days in a row with any XP (in that section, or anywhere), counting today if it has some. */
export function streak(p: Progress, section?: SectionId) {
  let n = 0
  const d = new Date()
  if (!dayXp(p, today(d), section)) d.setDate(d.getDate() - 1)
  while (dayXp(p, today(d), section)) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export const dailyGoal = (p: Progress) => PACES[p.pace].xp
export const crownCount = (p: Progress) => Object.keys(p.crowns).length
export const solvedCount = (p: Progress) => Object.keys(p.checked).filter((k) => k.startsWith('leetcode:')).length

/** Weeks to finish work written for COURSE_HOURS_PER_WEEK, at the chosen pace. */
export const weeksAtPace = (courseWeeks: number, pace: Pace) => (courseWeeks * COURSE_HOURS_PER_WEEK) / PACES[pace].hours
export function formatWeeks(w: number) {
  if (w < 0.75) return `~${Math.max(1, Math.round(w * 7))} days`
  const r = w < 10 ? Math.round(w * 2) / 2 : Math.round(w)
  return `~${r} wk${r === 1 ? '' : 's'}`
}

// ───────── items ─────────

export function toggleChecked(id: string, xp: number, section: SectionId = 'ai') {
  const on = !get().checked[id]
  update((p) => {
    const checked = { ...p.checked }
    if (on) checked[id] = true
    else delete checked[id]
    return { ...p, checked }
  })
  if (on) addXp(xp, section)
  return on
}

export function markDone(unitId: string, xp = 0, section: SectionId = 'ai') {
  const first = !get().done[unitId]
  update((p) => ({ ...p, done: { ...p.done, [unitId]: true } }))
  if (first) addXp(xp, section)
}

/** Remember the last thing opened in a section. */
export function touch(section: SectionId, item: Omit<Recent, 'at'>) {
  update((p) => ({ ...p, recent: { ...p.recent, [section]: { ...item, at: Date.now() } } }))
}

export const exportProgress = () => JSON.stringify(get(), null, 2)

export function importProgress(json: string) {
  const parsed = JSON.parse(json)
  if (typeof parsed !== 'object' || !parsed || !(parsed.xp || parsed.xpByDay)) throw new Error('Not a progress file')
  update(() => migrate(parsed))
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
  addXp(knew ? 2 : 1, 'ai')
}
