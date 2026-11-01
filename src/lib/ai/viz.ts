/* Small pictures for lesson screens, as HTML strings to drop into a screen's
 * markdown on a line of their own (marked passes block HTML through as is).
 * Each returns one line with no blank lines in it, or marked would split it.
 * Colours come from ai.css (.viz*), so they follow the theme. */

type Cell = number | string
type GridOpts = {
  /** cells to highlight, as "row,col"; "r,*" is a whole row, "*,c" a column */
  hl?: string[]
  /** extra faded copies, to show what broadcasting stretches: rows below, or columns to the right */
  ghostRows?: number
  ghostCols?: number
  /** shade each cell by its value from 0 to 9, like pixel brightness */
  shade?: boolean
  cap?: string
}

const lit = (hl: string[], r: number, c: number) => hl.some((h) => h === `${r},${c}` || h === `${r},*` || h === `*,${c}`)

/** A 2D (or 1D, as one row) array drawn as boxes. */
export function grid(rows: Cell[][] | Cell[], o: GridOpts = {}): string {
  const rs = (Array.isArray(rows[0]) ? rows : [rows]) as Cell[][]
  const cols = rs[0].length + (o.ghostCols ?? 0)
  const all = [...rs, ...Array.from({ length: o.ghostRows ?? 0 }, () => rs[0])]
  const cells = all
    .map((row, r) =>
      [...row, ...Array.from({ length: o.ghostCols ?? 0 }, () => row[0])]
        .map((v, c) => {
          const ghost = r >= rs.length || c >= rs[0].length
          const cls = ['viz-cell', ghost && 'ghost', !ghost && lit(o.hl ?? [], r, c) && 'hl', o.shade && Number(v) >= 5 && 'dark'].filter(Boolean).join(' ')
          const style = o.shade ? ` style="--v:${Number(v) * 11}%"` : ''
          return `<span class="${cls}${o.shade ? ' px' : ''}"${style}>${v}</span>`
        })
        .join(''),
    )
    .join('')
  return item(`<div class="viz-grid" style="grid-template-columns:repeat(${cols},auto)">${cells}</div>`, o.cap)
}

const item = (body: string, cap?: string) => `<div class="viz-item">${body}${cap ? `<span class="viz-cap">${cap}</span>` : ''}</div>`

/** Pictures side by side with operators between them: viz(grid(a), '+', grid(b), '=', grid(c)).
 * A string that starts with "<" is a picture; any other string is an operator. */
export function viz(...parts: string[]): string {
  return `<div class="viz">${parts.map((p) => (p.startsWith('<') ? p : `<span class="viz-op">${p}</span>`)).join('')}</div>`
}

/** Horizontal bars, scaled to the biggest value. */
export function bars(rows: { label: string; value: number; text: string }[], cap?: string): string {
  const max = Math.max(...rows.map((r) => r.value))
  const body = rows
    .map((r) => `<span class="viz-bar-label">${r.label}</span><span class="viz-bar"><span style="width:${Math.max((r.value / max) * 100, 0.6)}%"></span></span><span class="viz-bar-text">${r.text}</span>`)
    .join('')
  return `<div class="viz viz-col"><div class="viz-bars">${body}</div>${cap ? `<span class="viz-cap">${cap}</span>` : ''}</div>`
}

/** Where w is after each step, one lane per step, with the target marked:
 * shows steps shrinking, overshooting or bouncing at a glance. */
export function steps(ws: number[], { lo = 0, hi = 10, target = 5, cap }: { lo?: number; hi?: number; target?: number; cap?: string } = {}): string {
  const at = (w: number) => `${((w - lo) / (hi - lo)) * 100}%`
  const lanes = ws
    .map((w, i) => `<span class="viz-step-label">${i === 0 ? 'start' : `step ${i}`}</span><span class="viz-lane"><i class="viz-target" style="left:${at(target)}"></i><b style="left:${at(w)}"></b></span><span class="viz-step-w">w = ${+w.toFixed(4)}</span>`)
    .join('')
  return `<div class="viz viz-col"><div class="viz-steps">${lanes}</div><span class="viz-cap">${cap ? `${cap} · ` : ''}line = target ${target}</span></div>`
}
