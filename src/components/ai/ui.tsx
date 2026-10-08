/** Small pieces every AI Engineer island shares. */
import { useEffect, useState } from 'preact/hooks'
import { ICONS, type IconName } from '../../lib/icons'
import { get, subscribe, type Progress } from '../../lib/progress'

export function useProgress(): Progress {
  const [p, setP] = useState<Progress>(get)
  useEffect(() => subscribe(() => setP(get())), [])
  return p
}

export function Icon({ name, size = 20, class: cls, fill = 'none' }: { name: IconName; size?: number; class?: string; fill?: string }) {
  return (
    <svg class={cls} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export const XP = { concepts: 5, coreResource: 10, optionalResource: 5, build: 25, unitBonus: 10, quizCorrect: 5, checkpoint: 50, paper: 15, project: 100 }

export function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A module counts as started once any of its units is done or any of its checklist items is ticked. */
export function startedModules(p: Progress): Set<string> {
  const s = new Set<string>()
  for (const k of Object.keys(p.done)) s.add(k.split('/')[0])
  for (const k of Object.keys(p.checked)) if (!k.startsWith('paper:') && !k.startsWith('project:')) s.add(k.split(':')[0])
  return s
}
