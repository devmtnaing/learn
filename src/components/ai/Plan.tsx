/** Choosing a study pace, shown in hours a week. Shared by onboarding and the profile. */
import { PACES, update, type Pace } from '../../lib/progress'

export function PacePicker({ value, onPick }: { value: Pace; onPick?: (p: Pace) => void }) {
  return (
    <div class="pace-grid" role="radiogroup" aria-label="Study pace">
      {(Object.keys(PACES) as Pace[]).map((k) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          class={`pace ${value === k ? 'on' : ''}`}
          onClick={() => {
            update((p) => ({ ...p, pace: k }))
            onPick?.(k)
          }}
        >
          <b>{PACES[k].label}</b>
          <span class="pace-h">{PACES[k].hours} h / week</span>
          <small>{k === 'intense' ? 'about full-time' : `about ${Math.round((PACES[k].hours * 60) / 7)} min a day`}</small>
        </button>
      ))}
    </div>
  )
}
