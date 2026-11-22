import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, Target, TrendingUp } from 'lucide-react'
import { cent, dateFa } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { EmptyState, ProgressBar, StatCard } from '../components/UI'
import { AssessmentHero, AssessmentSkeleton, ResultRing, SubjectIcon } from '../components/AssessmentUI'
import type { Breakdown, DiagnosticResult } from '../types'
import { MockHistory } from './MockExams'

const kindLabels: Record<string, string> = { diagnostic: 'تعیین سطح', simulator: 'شبیه‌ساز', practice: 'تمرین مبحث' }
async function loadResults() {
  const [attempts, mastery, curriculum] = await Promise.all([cent.attempts(), cent.mastery(), cent.curriculum()])
  return { attempts: attempts.map(a => ({ ...a, result: JSON.parse(a.resultJson) as DiagnosticResult })), mastery, curriculum }
}
type ResultRow = Awaited<ReturnType<typeof loadResults>>['attempts'][number]
function breakdown(row: ResultRow, course: string): Breakdown | undefined {
  if (!course) return row.result
  return Object.entries(row.result.bySubject).find(([code]) => code === course)?.[1]
}
function comparable(row: ResultRow, course: string) {
  // Compare only the same kind and the same subject/topic question counts.
  const topics = Object.entries(row.result.byTopic).filter(([, t]) => !course || t.subject === course)
    .sort(([a], [b]) => a.localeCompare(b)).map(([name, t]) => [name, t.total])
  return JSON.stringify([row.kind, topics])
}

export function PersonalResults() {
  const remote = useRemote(loadResults)
  const { user } = useAppState()
  const [course, setCourse] = useState('')
  const rows = remote.data?.attempts.filter(row => (breakdown(row, course)?.total ?? 0) > 0) || []
  const latest = rows[0]
  const previous = latest && rows.slice(1).find(row => comparable(row, course) === comparable(latest, course))
  const change = latest && previous ? breakdown(latest, course)!.percentage - breakdown(previous, course)!.percentage : null
  const total = rows.reduce((sum, row) => sum + breakdown(row, course)!.total, 0)
  const correct = rows.reduce((sum, row) => sum + breakdown(row, course)!.correct, 0)
  return <div className="assessment-page personal-results">
    <AssessmentHero title="نتایج من" description={`${user?.name || ''}، نتیجه پاسخ‌هات رو مرور کن و برای ادامه تصمیم بگیر.`}><Link className="button button-secondary" to="/diagnostic/test">ارزیابی تازه</Link></AssessmentHero>
    {remote.busy ? <AssessmentSkeleton label="در حال دریافت نتایجت…"/> : <LoadState {...remote} retry={remote.reload}/>}
    {remote.data && !remote.busy && !remote.error && <>
      <label className="cent-section-select cent-results-filter">درس<select aria-label="فیلتر نتایج بر اساس درس" value={course} onChange={e => setCourse(e.target.value)}><option value="">همه درس‌ها</option>{remote.data.curriculum.courses.map(c => <option key={c.code} value={c.code}>{c.title}</option>)}</select></label>
      <div className="stats-grid" data-personal-stats>
        <StatCard label="نتایج اخیر" value={rows.length} icon={<ClipboardCheck/>}/>
        <StatCard label="آخرین نتیجه" value={latest ? `${breakdown(latest, course)!.percentage}٪` : '—'} note={latest ? kindLabels[latest.kind] : 'هنوز نتیجه‌ای ثبت نشده'} icon={<Target/>}/>
        <StatCard label="دقت در نتایج اخیر" value={total ? `${Math.round(100 * correct / total)}٪` : '—'} note={total ? `${correct} پاسخ صحیح از ${total} سؤال` : undefined} icon={<CheckCircle2/>}/>
        <StatCard label="تغییر نسبت به آزمون هم‌مبحث" value={change == null ? '—' : `${change > 0 ? '+' : ''}${change}`} note={previous ? `واحد درصد نسبت به ${dateFa(previous.createdAt)}` : 'پس از تکرار همان نوع آزمون و مباحث'} icon={<TrendingUp/>}/>
      </div>

      <MockHistory/>
      <h2>تاریخچه تعیین سطح و تمرین</h2>
      {rows.length === 0 && <EmptyState title="هنوز نتیجه‌ای برای این انتخاب ثبت نشده" description="بعد از ثبت پاسخ‌های تمرین یا آزمون، نتیجه‌ات اینجا نمایش داده می‌شه." action={<Link className="button button-primary" to={course ? `/diagnostic/test?course=${course}` : '/diagnostic/test'}>شروع ارزیابی سطح</Link>}/>}
      <div className="assessment-history">{rows.map(row => {
        const result = breakdown(row, course)!
        const subjects = remote.data!.curriculum.courses.filter(c => (breakdown(row, c.code)?.total ?? 0) > 0).map(c => c.title)
        return <Link className="card assessment-history-row" data-result-attempt={row.id} key={row.id} to={`/student/results/${row.id}`}><ResultRing value={result.percentage}/><div><span className="assessment-muted">{kindLabels[row.kind] || 'نتیجه ثبت‌شده'} · {dateFa(row.createdAt)}</span><h3>{subjects.join(' · ') || 'گزارش آزمون'}</h3><p>{result.correct} صحیح · {result.incorrect} نادرست · {result.unanswered} بی‌پاسخ از {result.total} سؤال</p></div><span className="text-link">دیدن گزارش</span></Link>
      })}</div>
      <section className="card assessment-panel"><div className="assessment-section-title"><h2>پیشرفت درس‌های من</h2><Link className="text-link" to="/student/analysis">تحلیل شخصی</Link></div><details className="assessment-method"><summary>تفاوت پیشرفت، پوشش و دقت چیه؟</summary><p>تمرین و آزمون هر دو در این برآورد اولیه حساب می‌شن. برای هر مبحث حداقل ۳ سؤال متفاوت لازمه؛ پاسخ تازه به سؤال تکراری جای پاسخ قبلی رو می‌گیره. پیشرفت کل، همه مباحث درس رو در نظر می‌گیره؛ پوشش نشون می‌ده چند مبحث واقعاً سنجیده شده. دقت از پاسخ‌های مباحث سنجیده‌شده میاد و درصد مطالعه نیست.</p></details>
        <div className="cent-results-courses">{remote.data.mastery.courses.filter(c => !course || c.code === course).map(c => {
          const recent = remote.data!.attempts.find(a => (breakdown(a, c.code)?.total ?? 0) > 0)
          const weak = c.topics.filter(t => t.masteryPercentage != null && t.masteryPercentage < 60).sort((a, b) => a.masteryPercentage! - b.masteryPercentage!).slice(0, 3)
          return <article className="cent-results-course" data-result-course={c.code} key={c.code}>
            <div className="assessment-course-heading"><SubjectIcon code={c.code}/><h3>{c.title}</h3></div><strong>{c.assessedTopics ? `${c.confirmedProgressPercentage}٪ پیشرفت` : 'هنوز سنجیده نشده'}</strong><div className={c.assessedTopics ? '' : 'assessment-unassessed'}><ProgressBar label={`پیشرفت ${c.title}`} value={c.confirmedProgressPercentage} valueText={c.assessedTopics ? undefined : 'هنوز سنجیده نشده'}/></div>
            <p>{c.assessedTopics} از {c.totalTopics} مبحث سنجیده شده · پوشش {c.coveragePercentage}٪</p>
            <p>دقت در مباحث سنجیده‌شده: {c.assessedAccuracyPercentage == null ? '—' : `${c.assessedAccuracyPercentage}٪`}</p>
            {recent && <p>آخرین نتیجه این درس: {breakdown(recent, c.code)!.percentage}٪ · {kindLabels[recent.kind]}</p>}
            {weak.length > 0 && <><b>مباحثی که به مرور نیاز دارند</b><ul>{weak.map(t => <li key={t.id}><Link to={`/student/practice?course=${c.code}&topic=${t.id}`}>{t.title} · {t.masteryPercentage}٪</Link></li>)}</ul></>}
            <Link className="text-link" to="/student/analysis">دیدن پیشرفت هر مهارت</Link>
          </article>
        })}</div>
      </section>
    </>}
  </div>
}
