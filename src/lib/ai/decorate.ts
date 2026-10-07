/* Paints saved progress onto the prerendered AI Engineer pages. The pages are
 * static, so they ship with every step looking "not started"; this marks the
 * done ones, the current one, crowns and percentages, and points the
 * Continue button at the next step. Markup contract:
 *
 *   [data-unit="t1-1.4/quiz"]           a step (its href is the step's page)
 *   [data-mod="t1-1.4"]                 a module card (gets crowned/started/current)
 *   [data-pct-of="id,id,…"]             text set to the % of those units done
 *   [data-meter-of="id,id,…"]           width set to that %
 *   [data-crowns-of="mod,mod,…"]        text set to "n/total"
 *   [data-continue]                     link pointed at the first unfinished step
 *   [data-ai-track="t1"]                visiting the page makes it the current track */
import { get, subscribe, update } from '../progress'

function paint() {
  const p = get()
  const steps = [...document.querySelectorAll<HTMLElement>('[data-unit]')]
  // pages listing several tracks continue in the track you were last in
  const inTrack = steps.filter((s) => s.dataset.unit!.startsWith(`${p.aiTrack}-`))
  const current = (inTrack.length ? inTrack : steps).find((s) => !p.done[s.dataset.unit!]) ?? steps.find((s) => !p.done[s.dataset.unit!])
  steps.forEach((s, i) => {
    const done = !!p.done[s.dataset.unit!]
    s.classList.toggle('done', done)
    s.classList.toggle('current', s === current)
    const prev = steps[i - 1]
    s.classList.toggle('linked', !!prev && prev.parentElement === s.parentElement && !!p.done[prev.dataset.unit!])
    s.setAttribute('aria-label', `${s.dataset.label}${done ? ' (done)' : s === current ? ' (next)' : ''}`)
  })
  const curMod = current?.dataset.unit?.split('/')[0]
  document.querySelectorAll<HTMLElement>('[data-mod]').forEach((m) => {
    const id = m.dataset.mod!
    m.classList.toggle('crowned', !!p.crowns[id])
    m.classList.toggle('current', id === curMod)
    m.classList.toggle('started', Object.keys(p.done).some((k) => k.startsWith(id + '/')) || Object.keys(p.checked).some((k) => k.startsWith(id + ':')))
  })
  const pct = (ids: string) => {
    const list = ids.split(',').filter(Boolean)
    return list.length ? Math.round((list.filter((u) => p.done[u]).length / list.length) * 100) : 0
  }
  document.querySelectorAll<HTMLElement>('[data-pct-of]').forEach((e) => (e.textContent = `${pct(e.dataset.pctOf!)}%`))
  document.querySelectorAll<HTMLElement>('[data-meter-of]').forEach((e) => (e.style.width = `${pct(e.dataset.meterOf!)}%`))
  document.querySelectorAll<HTMLElement>('[data-crowns-of]').forEach((e) => {
    const mods = e.dataset.crownsOf!.split(',').filter(Boolean)
    e.textContent = `${mods.filter((m) => p.crowns[m]).length}/${mods.length}`
  })
  document.querySelectorAll<HTMLAnchorElement>('[data-continue]').forEach((a) => {
    if (!current) return void (a.hidden = true)
    a.hidden = false
    a.href = (current as HTMLAnchorElement).href
    const label = a.querySelector('[data-continue-label]')
    if (label) label.textContent = `${current.dataset.modLabel} ${current.dataset.kindLabel}`
  })
}

paint()
subscribe(paint)

const track = document.querySelector<HTMLElement>('[data-ai-track]')?.dataset.aiTrack
if (track && get().aiTrack !== track) update((p) => ({ ...p, aiTrack: track }))
