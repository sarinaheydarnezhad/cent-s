import type { ExamOutcome } from '../services/cent'
import { Badge, Notice } from './UI'

export function PracticeReview({ outcome }: { outcome: ExamOutcome }) {
  return <>{outcome.review.map((q, i) => {
    const selected = outcome.result.answers[q.id]
    const passage = q.passageId ? outcome.passages?.find(p => p.id === q.passageId) : null
    return <details className="cent-answer-review assessment-review" key={q.id}><summary><span>سؤال {i + 1}</span><Badge tone={selected == null ? 'neutral' : selected === q.correctAnswer ? 'success' : 'error'}>{selected == null ? 'بدون پاسخ' : selected === q.correctAnswer ? 'صحیح' : 'نادرست'}</Badge></summary>
      {q.passageId && !passage ? <Notice tone="error">متن مرتبط با سؤال دریافت نشده است؛ گزارش را دوباره دریافت کنید.</Notice> : <>
        <div lang={outcome.contentContract === 'passage-v1' || q.passageId ? 'en' : undefined} dir={outcome.contentContract === 'passage-v1' || q.passageId ? 'ltr' : 'auto'}>{passage && <blockquote lang="en" dir="ltr">{passage.text}</blockquote>}{q.text && <h3>{q.text}</h3>}{q.figureSvg && <img className="cent-question-figure" alt="شکل سؤال" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(q.figureSvg)}`}/>}{q.options && <ol type="A">{q.options.map((o, index) => <li key={index}>{o} {index === q.correctAnswer ? '✓' : ''}{index === selected ? ' ←' : ''}</li>)}</ol>}<p>{q.explanation}</p></div>
        <p>پاسخ تو: {selected == null ? 'بدون پاسخ' : selected + 1} · گزینه صحیح: {q.correctAnswer + 1}</p>
      </>}
    </details>
  })}</>
}
