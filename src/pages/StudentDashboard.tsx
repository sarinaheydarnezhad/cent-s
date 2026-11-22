import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Atom, BookOpen, BrainCircuit, Calculator, ChevronLeft, ClipboardCheck, Clock3, Dna, FileText, FlaskConical, MessageSquare, Route, Target } from 'lucide-react'
import { cent, dateFa } from '../services/cent'
import { recommendationText, recommendationTopic } from '../services/learning-presentation'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { Badge, Card, EmptyState, Notice, ProgressBar, Skeleton } from '../components/UI'

async function latestAssessment() {
  const attempts = await cent.attempts()
  const latest = attempts[0]
  return latest ? { attempt: latest, outcome: await cent.outcome(latest.id) } : null
}
const kindLabels: Record<string, string> = { diagnostic: 'ارزیابی سطح', practice: 'تمرین مبحث', simulator: 'آزمون شبیه‌ساز' }
const subjectIcons: Record<string, typeof BookOpen> = { math: Calculator, logic: BrainCircuit, biology: Dna, chemistry: FlaskConical, physics: Atom }

// Decorative artwork only: no learner measurements, milestones or status.
function StudyIllustration() {
  return <svg className="student-illustration" viewBox="0 0 300 160" aria-hidden="true" focusable="false">
    <path className="study-hill" d="M6 145C3 104 30 22 97 31s70-27 119-3 57 72 77 117Z"/>
    <circle className="study-sun" cx="225" cy="40" r="23"/>
    <g className="study-books"><rect x="43" y="112" width="149" height="20" rx="5"/><rect x="52" y="92" width="121" height="20" rx="4"/><path d="M54 99h111M51 120h133"/></g>
    <g className="study-open-book"><path d="M104 49q28-10 54 7 27-17 55-7v59q-29-8-55 8-26-16-54-8Z"/><path d="M158 57v59m-42-52q17-3 30 4m-30 7q17-3 30 4m24-11q16-7 31-4m-31 15q16-7 31-4"/></g>
    <g className="study-leaf"><path d="M237 134V86m0 32q-29-4-24-28 24 3 24 28m0-12q-1-28 23-34 8 24-23 34"/><path d="M226 136h26"/></g>
    <path className="study-ground" d="M30 140h242"/>
  </svg>
}

function BookCover({ small = false }: { small?: boolean }) {
  return <span className={`student-book-cover${small ? ' small' : ''}`} aria-hidden="true"><BookOpen/><span>ITATEST</span></span>
}

export function StudentDashboard() {
  const library = useRemote(cent.library)
  const mastery = useRemote(cent.mastery)
  const curriculum = useRemote(cent.curriculum)
  const assessment = useRemote(latestAssessment)
  const { user } = useAppState()
  const recent = library.data?.progress.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const document = library.data?.documents.find(document => document.id === recent?.documentId)
  const readable = document && library.data?.readableTrainingIds.includes(document.trainingId)
  const relatedCourse = document && curriculum.data?.courses.find(course => course.trainingId === document.trainingId)
  const analysis = assessment.data?.outcome.analysis
  const guidance = analysis && recommendationText(analysis.suggestedNextStep, curriculum.data)
  const priorities = analysis?.priorityTopics.map(value => ({ value, ...recommendationText(value, curriculum.data), topic: recommendationTopic(value, curriculum.data) })) || []
  const unmapped = [...new Set([...(guidance?.unresolved || []), ...priorities.flatMap(value => value.unresolved)])]
  const resources = library.data?.documents.slice(0, 3) || []
  const notes = library.data?.notes.reduce((sum, note) => sum + note.count, 0)
  const fresh = !assessment.busy && !assessment.error && !assessment.data && !library.busy && !library.error && !recent
  const activity = [
    ...(!library.error && document && recent ? [{ id: `study-${document.id}`, href: `/student/study/${document.id}`, title: `${document.title} · صفحه ${recent.lastPage}`, date: recent.updatedAt, Icon: BookOpen }] : []),
    ...(!assessment.error && assessment.data ? [{ id: assessment.data.attempt.id, href: `/student/results/${assessment.data.attempt.id}`, title: `${kindLabels[assessment.data.attempt.kind] || 'نتیجه ثبت‌شده'} · ${assessment.data.outcome.result.percentage}٪`, date: assessment.data.attempt.createdAt, Icon: ClipboardCheck }] : []),
  ].sort((a, b) => b.date.localeCompare(a.date))

  return <div className={`student-overview${fresh ? ' student-is-new' : ''}`}>
    <section className="student-welcome" aria-labelledby="student-welcome-title">
      <div><span className="eyebrow">فضای یادگیری تو</span><h1 id="student-welcome-title">سلام {user?.name?.split(' ')[0] || ''}، خوش {fresh ? 'اومدی' : 'برگشتی'}</h1><p>سردرگم نمون، هدفمند بخون.</p><Badge tone="learning">آمادگی برای <bdi lang="en">CEnT-S</bdi></Badge></div>
      <StudyIllustration/>
    </section>

    <Card variant="recommendation" className="student-panel student-recommendation" data-dashboard-recommendation>
      <div className="student-section-head"><h2><Target aria-hidden="true"/> قدم بعدی پیشنهادی تو</h2>{analysis && <Badge tone="recommendation">براساس آخرین نتیجه</Badge>}</div>
      <span className="student-recommendation-art" aria-hidden="true"><BookOpen/></span>
      {assessment.busy || assessment.error ? <p className="student-caption">{assessment.busy ? 'در حال دریافت آخرین راهنمایی…' : 'برای دریافت پیشنهاد، آخرین نتیجه رو در بخش «آخرین نتیجه من» دوباره بارگذاری کن.'}</p> : analysis ? <>
        {curriculum.error ? <LoadState {...curriculum} retry={curriculum.reload}/> : curriculum.busy && <Skeleton label="در حال دریافت نام مباحث…" lines={2}/>}
        {analysis.status === 'FAILED' && <Notice tone="warning">راهنمایی این نتیجه کامل نشده. نتیجه ثبت‌شده‌ات رو می‌تونی در بخش «آخرین نتیجه من» ببینی.</Notice>}
        {guidance?.text && !guidance.unresolved.length ? <p dir="auto">{guidance.text}</p> : !guidance?.text ? <p>برای این نتیجه، پیشنهاد متنی در دسترس نیست. می‌تونی جزئیات نتیجه‌ات رو ببینی.</p> : null}
        <div className="student-priority-list">{priorities.map(priority => priority.topic ? <Link key={priority.value} to={`/student/practice?course=${priority.topic.courseCode}&topic=${priority.topic.id}`}><BookOpen size={18} aria-hidden="true"/><span dir="auto">{priority.text}</span><ChevronLeft size={16} aria-hidden="true"/></Link> : !priority.unresolved.length ? <span key={priority.value} dir="auto">{priority.text}</span> : null)}</div>
        {unmapped.length > 0 && <div className="student-mapping-note"><p>{curriculum.busy ? 'داریم نام مباحث پیشنهادی رو دریافت می‌کنیم.' : 'نام بعضی مباحث پیشنهادی فعلاً در دسترس نیست؛ می‌تونی از کتابخانه به مطالعه ادامه بدی.'}</p><details><summary>جزئیات مباحث نامشخص</summary><p>شناسه‌های اصلی برای پیگیری:</p>{unmapped.map(code => <bdi key={code} dir="ltr">{code} </bdi>)}{guidance?.unresolved.length ? <p dir="auto">{guidance.text}</p> : null}</details></div>}
        <Link className="button button-primary" to="/student/content">رفتن به مطالعه <ArrowLeft size={17} aria-hidden="true"/></Link>
      </> : <><h3>از شناخت مسیرت شروع کن</h3><p>با ارزیابی سطح، مباحثی رو که به مرور نیاز دارن بشناس و قدم بعدی‌ات رو پیدا کن.</p><Link className="button button-primary" to="/diagnostic/test">شروع ارزیابی سطح <ArrowLeft size={17} aria-hidden="true"/></Link></>}
    </Card>

    <Card className="student-panel student-resume" data-dashboard-resume>
      <div className="student-section-head"><h2><BookOpen aria-hidden="true"/> ادامه مطالعه</h2></div>
      {library.error ? <LoadState {...library} retry={library.reload}/> : library.busy && <Skeleton label="در حال دریافت محل مطالعه…" lines={3}/>}
      {library.data && !library.error && !library.busy && (document && recent ? <>
        <p className="student-caption">از همان‌جایی که مانده بودی، ادامه بده</p>
        <div className="student-resume-book"><BookCover/><div>{relatedCourse && <span className="student-subject-label">{relatedCourse.title}</span>}<h3 dir="auto">{document.title}</h3><p>آخرین مطالعه: صفحه {recent.lastPage} از {document.pageCount}</p><small>{dateFa(recent.updatedAt)}</small></div></div>
        {document.pageCount > 0 && <div className="student-reading-position"><label htmlFor="student-reading-meter">بیشترین صفحه بازشده <b>{recent.furthestPage} از {document.pageCount}</b></label><meter id="student-reading-meter" min={0} max={document.pageCount} value={recent.furthestPage} aria-valuetext={`تا صفحه ${recent.furthestPage} از ${document.pageCount} صفحه باز شده؛ این مقدار نشان‌دهنده تسلط نیست`}/></div>}
        <Link className="button button-primary" to={`/student/study/${document.id}`}>ادامه مطالعه <ArrowLeft size={17} aria-hidden="true"/></Link>
        {!readable && <p className="student-caption">دسترسی به این منبع ممکنه به تمدید نیاز داشته باشه؛ در صفحه مطالعه می‌تونی وضعیتش رو بررسی کنی.</p>}
      </> : <EmptyState title={library.data.documents.length ? 'آماده‌ای اولین صفحه رو باز کنی؟' : 'اولین مطالعه‌ات از اینجا شروع می‌شه'} description={library.data.documents.length ? 'یک منبع انتخاب کن؛ دفعه بعد از همین‌جا ادامه بده.' : 'یک آموزش انتخاب کن؛ محل مطالعه‌ات اینجا در دسترس می‌مونه.'} action={<Link className="button button-secondary" to={library.data.documents.length ? '/student/content' : '/package'}>{library.data.documents.length ? 'رفتن به کتابخانه' : 'دیدن آموزش‌ها'}</Link>}/>) }
    </Card>

    <Card className="student-panel student-assessment" data-dashboard-assessment>
      <h2><ClipboardCheck aria-hidden="true"/> آخرین نتیجه من</h2>
      {assessment.error ? <LoadState {...assessment} retry={assessment.reload}/> : assessment.busy && <Skeleton label="در حال دریافت آخرین نتیجه…" lines={3}/>}
      {!assessment.busy && !assessment.error && (assessment.data ? <>
        <div className="student-result-body"><div className="student-score-ring" style={{ '--result-percentage': `${assessment.data.outcome.result.percentage}%` } as CSSProperties}><strong className="student-score">{assessment.data.outcome.result.percentage}<small>٪</small></strong><span>پاسخ صحیح</span></div><div><span className="student-result-kind">{kindLabels[assessment.data.attempt.kind] || 'نتیجه ثبت‌شده'}</span><p>{assessment.data.outcome.result.correct} پاسخ صحیح از {assessment.data.outcome.result.total} سؤال</p><small className="student-caption">{dateFa(assessment.data.attempt.createdAt)}</small></div></div>
        <Link className="button button-secondary" to={`/student/results/${assessment.data.attempt.id}`}>دیدن نتیجه <ArrowLeft size={16} aria-hidden="true"/></Link>
      </> : <div className="student-first-assessment"><p>بعد از اولین ارزیابی یا تمرین، نتیجه‌ات رو اینجا می‌بینی.</p><Link className="text-link" to="/diagnostic/test">شروع ارزیابی سطح <ChevronLeft size={16} aria-hidden="true"/></Link></div>)}
    </Card>

    <Card className="student-panel student-progress" data-dashboard-progress>
      <div className="student-section-head"><h2><Route aria-hidden="true"/> مسیر یادگیری من</h2><Link className="text-link" to="/student/analysis">جزئیات پیشرفت <ChevronLeft size={16} aria-hidden="true"/></Link></div>
      <p className="student-caption">پیشرفت هر درس از پاسخ‌های ثبت‌شده در تمرین و آزمون برآورد می‌شه.</p>
      {mastery.error ? <LoadState {...mastery} retry={mastery.reload}/> : mastery.busy && <Skeleton label="در حال دریافت مسیر یادگیری…" lines={4}/>}
      {mastery.data && !mastery.error && !mastery.busy && <>
        {mastery.data.courses.length === 0 ? <EmptyState title="هنوز پیشرفتی در دسترس نیست" description="بعد از سنجش مباحث، پیشرفت درس‌ها رو اینجا می‌بینی." action={<Link className="text-link" to="/diagnostic/test">شروع ارزیابی سطح</Link>}/> : <div className="student-course-progress">{mastery.data.courses.map(course => {
          const Icon = subjectIcons[course.code] || BookOpen
          return <div key={course.code} className={course.assessedTopics ? 'student-course assessed' : 'student-course unassessed'}><span className="student-subject-icon"><Icon aria-hidden="true"/></span><div>
            <div className="student-progress-label"><Link to={`/courses/${course.code}`}>{course.title}</Link><strong>{course.assessedTopics ? `${course.confirmedProgressPercentage}٪` : 'سنجیده نشده'}</strong></div>
            <ProgressBar tone="learning" label={`پیشرفت ${course.title}`} value={course.confirmedProgressPercentage} valueText={course.assessedTopics ? `${course.confirmedProgressPercentage} درصد؛ ${course.assessedTopics} از ${course.totalTopics} مبحث سنجیده شده` : 'هنوز سنجیده نشده'}/>
            <small>{course.assessedTopics} از {course.totalTopics} مبحث سنجیده شده</small>
          </div></div>
        })}</div>}
        <p className="student-caption student-progress-note">مطالعه به‌تنهایی درصد تسلط رو تغییر نمی‌ده. مباحث سنجیده‌نشده در پیشرفت کل سهم صفر دارن.</p>
      </>}
    </Card>

    <section className="student-panel student-resources" data-dashboard-resources>
      <div className="student-section-head"><h2><FileText aria-hidden="true"/> منابع کتابخانه‌ات</h2><Link className="text-link" to="/student/content">همه منابع {library.data && !library.error && !library.busy ? `(${library.data.documents.length})` : ''}<ChevronLeft size={16} aria-hidden="true"/></Link></div>
      {library.busy || library.error ? <p className="student-caption">{library.busy ? 'در حال دریافت منابع…' : 'برای دریافت منابع، از بخش ادامه مطالعه دوباره تلاش کن.'}</p> : resources.length ? <div className="student-resource-list">{resources.map(resource => <Link to={`/student/study/${resource.id}`} key={resource.id}><BookCover small/><span><b dir="auto">{resource.title}</b><small>{resource.pageCount} صفحه · {library.data?.readableTrainingIds.includes(resource.trainingId) ? 'در دسترس برای مطالعه' : 'بررسی دسترسی'}</small></span><ChevronLeft size={18} aria-hidden="true"/></Link>)}</div> : <p className="student-caption">منابع آموزشی که انتخاب می‌کنی، اینجا کنار هم قرار می‌گیرن.</p>}
      <div className="student-notes-link"><MessageSquare aria-hidden="true"/><div><h3>یادداشت‌های من</h3><p>{notes === undefined || library.error || library.busy ? 'نکته‌هایی که در مسیر یادگیری ثبت کردی.' : notes ? `${notes} یادداشت ثبت‌شده برای مرور داری.` : 'نکته‌ها رو کنار هر صفحه بنویس؛ از اینجا مرورشون کن.'}</p></div><Link className="text-link" to="/student/notes">مرور <ChevronLeft size={16} aria-hidden="true"/></Link></div>
    </section>

    {(activity.length > 0 || library.error || assessment.error) && <section className="student-recent" aria-labelledby="student-recent-title"><h2 id="student-recent-title"><Clock3 aria-hidden="true"/> آخرین فعالیت‌های ثبت‌شده</h2>
      {activity.length > 0 && <ol>{activity.map(({ id, href, title, date, Icon }) => <li key={id}><Icon size={17} aria-hidden="true"/><Link to={href} dir="auto">{title}</Link><time dateTime={date}>{dateFa(date)}</time></li>)}</ol>}
      {(library.error || assessment.error) && <p className="student-caption">فعالیت‌ها کامل دریافت نشدن؛ بخش‌های بالا رو دوباره بررسی کن.</p>}
    </section>}
  </div>
}
