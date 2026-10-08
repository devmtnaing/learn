/* The AI Engineer course, read from the markdown in /course at build time.
 * The markdown is the source of truth: edit a track's README and the pages
 * follow on the next build. Only Astro pages import this module; islands get
 * the slices they need as props, so the markdown never ships to the browser. */
import { marked } from 'marked'
import { quizzes } from './quizzes'

const files = import.meta.glob('/course/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const read = (p: string) => {
  const s = files[`/course/${p}`]
  if (s == null) throw new Error(`course file missing: ${p}`)
  return s
}

export type Resource = { id: string; core: boolean; html: string; sub: string[] }
export type BuildItem = { id: string; html: string }
export type Module = {
  id: string
  key: string
  slug: string
  label: string
  title: string
  star: boolean
  weeks: string | null
  why: string
  concepts: string[]
  resources: Resource[]
  build: BuildItem[]
  checkpoint: string
  notes?: string
  guideHtml: string
}
export type Track = { id: string; slug: string; title: string; short: string; subtitle: string; color: string; modules: Module[] }
export type Paper = { id: string; star: boolean; title: string; by: string; url: string | null }
export type PaperSection = { title: string; papers: Paper[] }
export type Project = { id: string; title: string; template: boolean; html: string }
export type UnitKind = 'concepts' | 'resources' | 'build' | 'quiz' | 'checkpoint'

const hash = (s: string) => {
  let h = 5381
  for (const c of s) h = ((h << 5) + h + c.codePointAt(0)!) >>> 0
  return h.toString(36)
}
const linkOut = (html: string) => html.replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener" href="$1')
const inline = (md: string) => linkOut(marked.parseInline(md.trim()) as string)
// Task-list boxes in the guides are decoration (progress is ticked in the Build
// step), so they become plain markers instead of unlabelled, disabled inputs.
const block = (md: string) =>
  linkOut(marked.parse(md) as string).replace(/<input (checked="" )?disabled="" type="checkbox">\s*/g, (_, on) => `<span class="task" aria-hidden="true">${on ? '☑' : '☐'}</span> `)

const TRACKS = [
  { id: 'setup', slug: 'setup', file: '00-setup/README.md', title: 'Setup', short: 'Setup', subtitle: 'Tools, GPUs and notes. Week 0.', color: 'slate', heading: /^## (?!Checkpoint)(\d+)\. (.+)$/ },
  { id: 't1', slug: 'track-1', file: 'track-1-ai-application-engineer/README.md', title: 'AI Application Engineer', short: 'Track 1', subtitle: 'Use models well: APIs, RAG, agents, MCP, evals.', color: 'sky', heading: /^## (1\.\d+) (.+)$/ },
  { id: 't2', slug: 'track-2', file: 'track-2-ml-systems-engineer/README.md', title: 'ML / AI Systems Engineer', short: 'Track 2', subtitle: 'Train, tune, optimise and serve models.', color: 'indigo', heading: /^### (2\.\d+) (.+)$/ },
  { id: 't3', slug: 'track-3', file: 'track-3-research-engineer/README.md', title: 'AI Research Engineer', short: 'Track 3', subtitle: 'Understand and improve models.', color: 'rose', heading: /^### (3\.\d+) (.+)$/ },
  { id: 'math', slug: 'math', file: 'math/README.md', title: 'Math Track', short: 'Math', subtitle: 'Runs alongside all three tracks.', color: 'amber', heading: /^## Level (\d): (.+)$/ },
]

function weeksTable(md: string) {
  const weeks: Record<string, string> = {}
  for (const m of md.matchAll(/^\| (\d+\.\d+) \| [^|]+\| (\d[\d–-]*) \|/gm)) weeks[m[1]] = m[2]
  return weeks
}

function parseBody(lines: string[], moduleId: string) {
  // checklist ids carry the module id, so "has this module been started?" is a prefix test
  const id = (s: string) => `${moduleId}:${hash(s)}`
  const mod = { why: '', concepts: [] as string[], resources: [] as Resource[], build: [] as BuildItem[], checkpoint: '', notes: undefined as string | undefined }
  let section = ''
  let last: Resource | null = null
  for (const raw of lines) {
    const line = raw.trimEnd()
    const t = line.trim()
    if (!t || t === '---') continue
    let m: RegExpMatchArray | null
    if ((m = t.match(/^\*\*Why[^*]*\*\*:?\s*(.*)$/))) {
      mod.why = inline(m[1])
      section = 'why'
    } else if ((m = t.match(/^\*\*Concepts:\*\*\s*(.*)$/))) {
      mod.concepts.push(...m[1].split(/;\s*/).map((s) => s.replace(/\.$/, '').trim()).filter(Boolean).map(inline))
      section = 'concepts'
    } else if ((m = t.match(/^\*\*Checkpoint:\*\*\s*(.*)$/))) {
      mod.checkpoint = inline(m[1])
      section = 'checkpoint'
    } else if (/^\*\*(Learn|Topics|Build|Method|Communities & programs)\*\*/.test(t)) {
      section = t.match(/^\*\*([^*]+)\*\*/)![1].toLowerCase()
    } else if (/^#{3,4} /.test(t)) {
      section = 'topics' // math sub-sections like "### 2a. Linear algebra"
    } else if ((m = t.match(/^- \[[ x]\] (.+)$/))) {
      mod.build.push({ id: id(m[1]), html: inline(m[1]) })
    } else if ((m = t.match(/^- \*(Core|Optional):\*\s*(.+)$/))) {
      last = { id: id(m[2]), core: m[1] === 'Core', html: inline(m[2]), sub: [] }
      mod.resources.push(last)
    } else if (last && /^\s+\d+\. /.test(line)) {
      last.sub.push(inline(t.replace(/^\d+\.\s*/, '')))
    } else if ((m = t.match(/^- (.+)$/))) {
      if (section === 'topics' || section === 'concepts') mod.concepts.push(inline(m[1]))
      else if (section === 'build') mod.build.push({ id: id(m[1]), html: inline(m[1]) })
      else if (section === 'communities & programs') mod.resources.push({ id: id(m[1]), core: false, html: inline(m[1]), sub: [] })
      else if (section === 'method' || section === '') mod.notes = (mod.notes || '') + `<li>${inline(m[1])}</li>`
    } else if ((m = t.match(/^\d+\. (.+)$/)) && section === 'method') {
      mod.notes = (mod.notes || '') + `<li>${inline(m[1])}</li>`
    } else if (section === 'why' && !t.startsWith('*') && !t.startsWith('|')) {
      mod.why += ' ' + inline(t)
    }
  }
  mod.why = mod.why.trim().replace(/^([a-z])/, (c) => c.toUpperCase())
  return mod
}

function parseTrack(cfg: (typeof TRACKS)[number]): Track {
  const md = read(cfg.file)
  const weeks = weeksTable(md)
  const raw: { key: string; title: string; star: boolean; lines: string[] }[] = []
  let cur: (typeof raw)[number] | null = null
  let stop = false
  for (const line of md.split('\n')) {
    const m = line.match(cfg.heading)
    if (m) {
      cur = { key: m[1], title: m[2].replace(/★/g, '').replace(/\(.*?\)\s*$/, '').trim(), star: line.includes('★'), lines: [] }
      raw.push(cur)
      stop = false
      continue
    }
    if (/^## /.test(line) && cur) {
      if (cfg.id === 'setup' && /^## Checkpoint/.test(line)) {
        cur = { key: 'ck', title: 'Setup checkpoint', star: false, lines: [] }
        raw.push(cur)
        continue
      }
      stop = true // a level-2 heading that isn't a module ends the module
    }
    if (cur && !stop) cur.lines.push(line)
  }
  return {
    id: cfg.id,
    slug: cfg.slug,
    title: cfg.title,
    short: cfg.short,
    subtitle: cfg.subtitle,
    color: cfg.color,
    modules: raw.map((r) => {
      const id = `${cfg.id}-${r.key}`
      const slug = cfg.id === 'math' ? `level-${r.key}` : cfg.id === 'setup' ? (r.key === 'ck' ? 'checkpoint' : `step-${r.key}`) : r.key.replace('.', '-') // no dots in URLs: '2.7' would read as a file extension
      const label = cfg.id === 'math' ? `Level ${r.key}` : cfg.id === 'setup' ? (r.key === 'ck' ? 'Checkpoint' : `Step ${r.key}`) : r.key
      return {
        id,
        key: r.key,
        slug,
        label,
        title: r.title,
        star: r.star,
        weeks: weeks[r.key] ?? null,
        ...parseBody(r.lines, id),
        guideHtml: block(r.lines.join('\n').replace(/^---\s*$/gm, '')),
      }
    }),
  }
}

function parsePapers(): PaperSection[] {
  const sections: PaperSection[] = []
  let cur: PaperSection | null = null
  for (const line of read('track-3-research-engineer/papers.md').split('\n')) {
    let m: RegExpMatchArray | null
    if ((m = line.match(/^## (\d+)\. (.+)$/))) {
      cur = { title: m[2], papers: [] }
      sections.push(cur)
      continue
    }
    if (line.startsWith('## ')) cur = null
    if (cur && (m = line.match(/^- \[[ x]\] (.+)$/))) {
      const text = m[1]
      if (text.startsWith('*')) continue
      const title = text.match(/\*\*(.+?)\*\*/)?.[1] ?? text
      cur.papers.push({
        id: `paper:${hash(title)}`,
        star: text.includes('⭐'),
        title,
        by: text.split(':')[0].replace('⭐', '').trim(),
        url: text.match(/<(https?:[^>]+)>/)?.[1] ?? null,
      })
    }
  }
  return sections
}

function parseProjects(): Project[] {
  const [body, template = ''] = read('projects/README.md').split(/^## Write-up template\s*$/m)
  const parts: Project[] = body
    .split(/^## /m)
    .slice(1)
    .map((p) => {
      const [first, ...rest] = p.split('\n')
      return { id: `project:${hash(first)}`, title: first.trim(), template: false, html: block(rest.join('\n').replace(/^---\s*$/gm, '')) }
    })
  if (template) parts.push({ id: 'project:template', title: 'Write-up template', template: true, html: block(template) })
  return parts
}

export const tracks: Track[] = TRACKS.map(parseTrack)
export const papers = parsePapers()
export const projects = parseProjects()

// ───────── units: the five steps of every module ─────────

export const UNIT_LABEL: Record<UnitKind, string> = { concepts: 'Concepts', resources: 'Learn', build: 'Build', quiz: 'Quiz', checkpoint: 'Checkpoint' }
export const UNIT_SLUG: Record<UnitKind, string> = { concepts: 'concepts', resources: 'learn', build: 'build', quiz: 'quiz', checkpoint: 'checkpoint' }

export const BASE = '/ai-engineer'
export const trackUrl = (t: Track) => `${BASE}/${t.slug}`
export const moduleUrl = (t: Track, m: Module) => `${BASE}/${t.slug}/${m.slug}`
export const unitUrl = (t: Track, m: Module, k: UnitKind) => `${moduleUrl(t, m)}/${UNIT_SLUG[k]}`

export function unitKinds(m: Module): UnitKind[] {
  const k: UnitKind[] = ['concepts']
  if (m.resources.length) k.push('resources')
  if (m.build.length) k.push('build')
  if (quizzes[m.id]?.length) k.push('quiz')
  if (m.checkpoint) k.push('checkpoint')
  return k
}

/** What the browser needs to know about one unit: enough for progress, "up next" and links. */
export type UnitRef = { id: string; kind: UnitKind; label: string; url: string; module: string; moduleTitle: string; moduleLabel: string; track: string; trackShort: string; color: string }

export const units: UnitRef[] = tracks.flatMap((t) =>
  t.modules.flatMap((m) =>
    unitKinds(m).map((k) => ({
      id: `${m.id}/${k}`,
      kind: k,
      label: UNIT_LABEL[k],
      url: unitUrl(t, m, k),
      module: m.id,
      moduleTitle: m.title,
      moduleLabel: m.label,
      track: t.id,
      trackShort: t.short,
      color: t.color,
    })),
  ),
)

export const trackColor = (trackId: string) => tracks.find((t) => t.id === trackId)?.color ?? 'indigo'

/** Weeks a track takes at the course's own pace (~13.5 h/week): its modules' estimates, upper end of a range. */
export const trackWeeks = (t: Track) => t.modules.reduce((a, m) => a + (Number(m.weeks?.split(/[–-]/).at(-1)) || 0), 0)
/** Upper end of a module's estimate, in course weeks, or 0 when it has none. */
export const moduleWeeks = (m: Module) => Number(m.weeks?.split(/[–-]/).at(-1)) || 0
