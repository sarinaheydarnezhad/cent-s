import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, Target, TrendingUp } from 'lucide-react'
import { cent, dateFa } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { EmptyState, PageHeader, ProgressBar, StatCard } from '../components/UI'
import type { Breakdown, DiagnosticResult } from '../types'

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
  return <>
    <PageHeader title="نتایج من" description={`${user?.name || ''}، پیشرفت این صفحه از پاسخ‌ها و نتایج ثبت‌شده خودت محاسبه می‌شود.`} action={<Link className="button button-primary" to="/diagnostic/test">ارزیابی تازه</Link>}/>
    <LoadState {...remote} retry={remote.reload}/>
    {remote.data && <>
      <label className="cent-section-select cent-results-filter">درس<select aria-label="فیلتر نتایج بر اساس درس" value={course} onChange={e => setCourse(e.target.value)}><option value="">همه درس‌ها</option>{remote.data.curriculum.courses.map(c => <option key={c.code} value={c.code}>{c.title}</option>)}</select></label>
      <div className="stats-grid" data-personal-stats>
        <StatCard label="نتایج اخیر" value={rows.length} icon={<ClipboardCheck/>}/>
        <StatCard label="آخرین نتیجه" value={latest ? `${breakdown(latest, course)!.percentage}٪` : '—'} note={latest ? kindLabels[latest.kind] : 'هنوز نتیجه‌ای ثبت نشده'} icon={<Target/>}/>
        <StatCard label="دقت در نتایج اخیر" value={total ? `${Math.round(100 * correct / total)}٪` : '—'} note={total ? `${correct} پاسخ صحیح از ${total} سؤال` : undefined} icon={<CheckCircle2/>}/>
        <StatCard label="تغییر نسبت به آزمون هم‌مبحث" value={change == null ? '—' : `${change > 0 ? '+' : ''}${change}`} note={previous ? `واحد درصد نسبت به ${dateFa(previous.createdAt)}` : 'پس از تکرار همان نوع آزمون و مباحث'} icon={<TrendingUp/>}/>
      </div>
      <section className="card cent-admin-panel"><h2>پیشرفت درس‌های من</h2><p>تمرین و آزمون هر دو در این برآورد اولیه حساب می‌شوند. برای هر مبحث حداقل ۳ سؤال متفاوت لازم است؛ پاسخ تازه به سؤال تکراری جای پاسخ قبلی را می‌گیرد. پیشرفت کل، همه مباحث درس را در نظر می‌گیرد؛ پوشش نشان می‌دهد چند مبحث واقعاً سنجیده شده است.</p>
        <div className="cent-results-courses">{remote.data.mastery.courses.filter(c => !course || c.code === course).map(c => {
          const recent = remote.data!.attempts.find(a => (breakdown(a, c.code)?.total ?? 0) > 0)
          const weak = c.topics.filter(t => t.masteryPercentage != null && t.masteryPercentage < 60).sort((a, b) => a.masteryPercentage! - b.masteryPercentage!).slice(0, 3)
          return <article className="cent-results-course" data-result-course={c.code} key={c.code}>
            <h3>{c.title}</h3><strong>{c.assessedTopics ? `${c.confirmedProgressPercentage}٪ پیشرفت` : 'هنوز سنجیده نشده'}</strong><ProgressBar value={c.confirmedProgressPercentage}/>
            <p>{c.assessedTopics} از {c.totalTopics} مبحث سنجیده شده · پوشش {c.coveragePercentage}٪</p>
            <p>دقت در مباحث سنجیده‌شده: {c.assessedAccuracyPercentage == null ? '—' : `${c.assessedAccuracyPercentage}٪`}</p>
            {recent && <p>آخرین نتیجه این درس: {breakdown(recent, c.code)!.percentage}٪ · {kindLabels[recent.kind]}</p>}
            {weak.length > 0 && <><b>مباحثی که به مرور نیاز دارند</b><ul>{weak.map(t => <li key={t.id}><Link to={`/student/practice?course=${c.code}&topic=${t.id}`}>{t.title} · {t.masteryPercentage}٪</Link></li>)}</ul></>}
            <Link className="text-link" to="/student/analysis">دیدن پیشرفت هر مهارت</Link>
          </article>
        })}</div>
      </section>
      <h2>تاریخچه نتایج من</h2>
      {rows.length === 0 && <EmptyState title="هنوز نتیجه‌ای برای این انتخاب ثبت نشده" description="پس از ثبت پاسخ‌های تمرین یا آزمون، نتیجه واقعی و پیشرفتت اینجا نمایش داده می‌شود."/>}
      <div className="cent-notes-grid">{rows.map(row => {
        const result = breakdown(row, course)!
        const subjects = remote.data!.curriculum.courses.filter(c => (breakdown(row, c.code)?.total ?? 0) > 0).map(c => c.title)
        return <Link className="card cent-saved-note" data-result-attempt={row.id} key={row.id} to={`/student/results/${row.id}`}><span>{kindLabels[row.kind] || row.kind} · {dateFa(row.createdAt)}</span><h3>{subjects.join(' · ')}</h3><h2>{result.percentage}٪</h2><p>{result.correct} صحیح · {result.incorrect} نادرست · {result.unanswered} بی‌پاسخ از {result.total} سؤال</p><span className="text-link">دیدن گزارش</span></Link>
      })}</div>
    </>}
  </>
}
