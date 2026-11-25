import { Link } from 'react-router-dom'
import { useRemote } from './CentUI'
import { cent } from '../services/cent'

export function ReviewedAssessmentPicker() {
  const catalog = useRemote(cent.reviewedAssessments)
  if (!catalog.data?.length) return null
  return <section className="container card" aria-label="آزمون‌های تمرینی فصل‌ها"><h2>مرور فصل و آزمون تمرینی</h2><p>این آزمون‌ها تألیفی هستند. پاسخ و توضیح پس از ثبت پاسخ‌ها نمایش داده می‌شود.</p><ul>{catalog.data.map(a => <li key={a.id}><Link className="button button-secondary" to={`/student/practice?assessment=${encodeURIComponent(a.id)}`}>{a.title} · {a.questionCount} سؤال · {a.durationMinutes} دقیقه</Link></li>)}</ul></section>
}
