/** Eight random questions from quizzes already finished. */
import { useMemo, useState } from 'preact/hooks'
import { get, totalXp } from '../../lib/progress'
import { reviewPool } from './Practice'
import { DoneScreen, Quiz } from './Session'
import { shuffle, useProgress } from './ui'

export default function Review() {
  const p = useProgress()
  const [startXp] = useState(() => totalXp(get()))
  const [result, setResult] = useState<string | null>(null)
  const questions = useMemo(() => shuffle(reviewPool(get())).slice(0, 8), [])
  const back = () => {
    location.href = '/ai-engineer/practice'
  }
  if (!questions.length) {
    back()
    return null
  }
  if (result) return <DoneScreen title="Review complete" sub={result} xp={totalXp(p) - startXp} onContinue={back} />
  return <Quiz questions={questions} title="Mixed review" exit={back} onComplete={(c, t) => setResult(`${c} of ${t} right on the first try.`)} />
}
