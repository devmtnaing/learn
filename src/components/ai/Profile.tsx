/** Site-wide progress: totals, each section, the study plan, and moving data between browsers. */
import { useRef, useState } from 'preact/hooks'
import {
  crownCount, exportProgress, formatWeeks, importProgress, PACES, resetProgress, solvedCount, streak, totalXp, update, weeksAtPace,
} from '../../lib/progress'
import { PacePicker } from './Plan'
import { Icon, useProgress } from './ui'

export type TrackSummary = { id: string; url: string; short: string; title: string; color: string; units: string[]; modules: string[]; weeks: number }

function Stat({ icon, color, n, l }: { icon: 'flame' | 'bolt' | 'crown' | 'check'; color: string; n: number; l: string }) {
  return (
    <div class="card row">
      <span class="chip-icon" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
        <Icon name={icon} />
      </span>
      <span class="grow">
        <b style={{ fontFamily: 'var(--display)', fontSize: '22px' }}>{n}</b>
        <small>{l}</small>
      </span>
    </div>
  )
}

export default function Profile({ tracks, problems }: { tracks: TrackSummary[]; problems: number }) {
  const p = useProgress()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([exportProgress()], { type: 'application/json' }))
    a.download = `learn-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }
  const onFile = async (f?: File) => {
    if (!f) return
    try {
      importProgress(await f.text())
      setMsg('Progress imported.')
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`)
    }
  }
  return (
    <>
      <h2 class="section-title" style={{ marginTop: 0 }}>
        All sections
      </h2>
      <div class="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))' }}>
        <Stat icon="flame" color="var(--streak)" n={streak(p)} l="day streak, any section" />
        <Stat icon="bolt" color="var(--xp)" n={totalXp(p)} l="total XP" />
      </div>

      <h2 class="section-title">LeetCode</h2>
      <div class="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))' }}>
        <Stat icon="check" color="var(--teal)" n={solvedCount(p)} l={`of ${problems} problems solved`} />
        <Stat icon="flame" color="var(--streak)" n={streak(p, 'leetcode')} l="day streak" />
        <Stat icon="bolt" color="var(--xp)" n={totalXp(p, 'leetcode')} l="XP" />
      </div>

      <h2 class="section-title">AI Engineer</h2>
      <div class="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', marginBottom: '12px' }}>
        <Stat icon="crown" color="var(--indigo)" n={crownCount(p)} l="modules crowned" />
        <Stat icon="flame" color="var(--streak)" n={streak(p, 'ai')} l="day streak" />
        <Stat icon="bolt" color="var(--xp)" n={totalXp(p, 'ai')} l="XP" />
      </div>
      <div class="grid-cards">
        {tracks.map((t) => {
          const pct = t.units.length ? Math.round((t.units.filter((u) => p.done[u]).length / t.units.length) * 100) : 0
          return (
            <a key={t.id} href={t.url} class={`card tc-${t.color}`} style={{ borderTop: '4px solid var(--c)' }}>
              <div class="row">
                <span class="grow">
                  <b>
                    {t.short}: {t.title}
                  </b>
                  <small>
                    {t.modules.filter((m) => p.crowns[m]).length} / {t.modules.length} modules crowned
                    {t.weeks ? ` · ${formatWeeks(weeksAtPace(t.weeks, p.pace))} at your pace` : ''}
                  </small>
                </span>
                <b>{pct}%</b>
              </div>
              <div class="meter" style={{ marginTop: '12px' }}>
                <i style={{ width: `${pct}%` }} />
              </div>
            </a>
          )
        })}
      </div>

      <h2 class="section-title" id="plan">
        Study plan
      </h2>
      <p class="page-sub" style={{ marginBottom: 0 }}>
        How many hours a week you can study. It sets your daily goal ({PACES[p.pace].xp} XP at {PACES[p.pace].label}) and every time estimate in the AI Engineer course.
      </p>
      <PacePicker value={p.pace} />
      <p class="page-sub" style={{ margin: '16px 0 8px' }}>
        Current AI Engineer track ("up next" follows it; opening a lesson in another track switches it):
      </p>
      <div class="seg" role="radiogroup" aria-label="Current track">
        {tracks.map((t) => (
          <button key={t.id} role="radio" aria-checked={p.aiTrack === t.id} class={p.aiTrack === t.id ? 'on' : ''} onClick={() => update((x) => ({ ...x, aiTrack: t.id, aiOnboarded: true }))}>
            {t.short}
          </button>
        ))}
      </div>

      <h2 class="section-title">Your data</h2>
      <p class="page-sub" style={{ marginBottom: '12px' }}>
        Progress is saved in this browser only, until sign-in arrives. Export it to back it up or move it to another device. Files exported from the standalone AI Engineer site import too.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button class="btn ghost sm" onClick={download}>
          <Icon name="download" size={16} /> Export
        </button>
        <button class="btn ghost sm" onClick={() => file.current?.click()}>
          <Icon name="upload" size={16} /> Import
        </button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => onFile((e.target as HTMLInputElement).files?.[0])} />
        <button
          class="btn red sm"
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone. Export first if unsure.')) resetProgress()
          }}
        >
          Reset
        </button>
      </div>
      {msg && (
        <p class="page-sub" role="status" style={{ marginTop: '10px' }}>
          {msg}
        </p>
      )}
    </>
  )
}
