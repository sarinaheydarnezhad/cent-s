import { PersonalResults } from './PersonalResults'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, MessageSquare, Sparkles, Target } from 'lucide-react'
import { cent, type ExamAttempt, type ExamOutcome } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { PageHeader, ProgressBar, StatCard } from '../components/UI'
import type { AnswerMap } from '../types'
import { studyReturnPath } from '../services/study-return'

export function CentDashboard() {
  const remote = useRemote(cent.library)
  const { diagnosticResult, aiAnalysis } = useAppState()
  const recent = remote.data?.progress.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const document = remote.data?.documents.find(d => d.id === recent?.documentId)
  return <><PageHeader eyebrow="یک قدم در هر روز" title="امروز از کجا ادامه می‌دهی؟" description="فضایی برای یادگیری متمرکز، مرور نوشته‌ها و سنجش مسیرت." action={<Link className="button button-primary" to="/student/content">کتابخانه من <ArrowLeft size={18}/></Link>}/><LoadState {...remote} retry={remote.reload}/><section className="cent-dashboard-lead"><div><span className="pill light"><BookOpen size={16}/> مسیر شخصی تو</span><h2>{document ? document.title : 'اولین صفحه منتظر توست.'}</h2><p>{recent && document ? `آخرین بار تا صفحه ${recent.lastPage} خواندی. یادداشت‌هایت همان‌جا منتظرند.` : 'آموزشت را انتخاب کن، در حاشیه‌اش بنویس و هر بار از همان‌جا ادامه بده.'}</p><Link className="button button-secondary" to={document ? `/student/study/${document.id}` : '/package'}>{document ? 'ادامه مطالعه' : 'انتخاب آموزش'}<ArrowLeft size={17}/></Link></div><div className="cent-dashboard-symbol"><BookOpen/><span>READ / REFLECT / REPEAT</span></div></section><div className="stats-grid"><StatCard icon={<BookOpen/>} label="آموزش‌های کتابخانه" value={remote.data?.trainings.length ?? '—'}/><StatCard icon={<MessageSquare/>} label="یادداشت‌های من" value={remote.data?.notes.reduce((sum, n) => sum + n.count, 0) ?? '—'}/><StatCard icon={<Target/>} label="آخرین نتیجه" value={diagnosticResult ? `${diagnosticResult.percentage}٪` : '—'}/><StatCard icon={<Sparkles/>} label="اشتراک مطالعه" value={remote.data ? remote.data.hasSubscription ? 'فعال' : 'غیرفعال' : '—'}/></div><div className="cent-admin-columns"><section className="card cent-admin-panel"><span className="eyebrow">یادداشت‌های کنار مسیر</span><h2>آنچه یاد گرفته‌ای، همراهت می‌ماند.</h2><p>همه نکته‌هایت را مرور کن؛ حتی اگر اشتراکت تمام شده باشد.</p><Link className="text-link" to="/student/notes">مرور یادداشت‌ها <ArrowLeft size={16}/></Link></section><section className="card cent-admin-panel"><span className="eyebrow">قدم بعدی</span><h2>{aiAnalysis ? 'براساس آخرین ارزیابی تو' : 'مسیرت را بهتر بشناس'}</h2><p>{aiAnalysis?.suggestedNextStep || 'با تعیین سطح، مباحثی را که به مرور بیشتری نیاز دارند پیدا کن.'}</p><Link className="text-link" to="/diagnostic/test">تعیین سطح <ArrowLeft size={16}/></Link></section></div></>
}

export function CentExamPage({ kind = 'diagnostic' }: { kind?: 'diagnostic' | 'simulator' | 'practice' }) {
  const { user, loading, setDiagnostic } = useAppState()
  const [params] = useSearchParams()
  const returnToStudy = studyReturnPath(params.get('returnTo'))
  const catalog = useRemote(cent.curriculum)
  const [course, setCourse] = useState(params.get('course') || '')
  const [topic, setTopic] = useState(params.get('topic') || '')
  const storageKey = `cent:exam:${user?.id}:${kind}:${course}:${topic}`
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(3600)
  const requestId = useRef(crypto.randomUUID())
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as { attempt: ExamAttempt; answers: AnswerMap } | null
      if (saved && Date.parse(saved.attempt.expiresAt) > Date.now()) { setAttempt(saved.attempt); setAnswers(saved.answers) }
      else sessionStorage.removeItem(storageKey)
    } catch { sessionStorage.removeItem(storageKey) }
  }, [storageKey])
  useEffect(() => { if (attempt) sessionStorage.setItem(storageKey, JSON.stringify({ attempt, answers })) }, [attempt, answers, storageKey])
  useEffect(() => {
    if (!attempt) return
    const tick = () => setRemaining(Math.max(0, Math.floor((Date.parse(attempt.expiresAt) - Date.now()) / 1000)))
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer)
  }, [attempt])
  if (loading) return <LoadState busy error="" retry={() => {}}/>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>
  async function start() {
    setBusy(true); setError('')
    try { setAttempt(await cent.startExam(kind, requestId.current, course || undefined, topic || undefined)); setIndex(0); setAnswers({}) }
    catch (e) { setError(e instanceof Error ? e.message : 'آزمون آماده نشد.') } finally { setBusy(false) }
  }
  async function submit() {
    if (!attempt) return
    setBusy(true); setError('')
    try {
      const outcome = await cent.submitExam(attempt.id, answers)
      setDiagnostic(outcome.result, outcome.analysis)
      sessionStorage.removeItem(storageKey)
      navigate(`/student/results/${attempt.id}${returnToStudy ? `?returnTo=${encodeURIComponent(returnToStudy)}` : ''}`)
    } catch (e) { setError(e instanceof Error ? e.message : 'ثبت نتیجه انجام نشد؛ پاسخ‌هایت حفظ شده‌اند.'); setBusy(false) }
  }
  const question = attempt?.questions[index]
  return <div className="container cent-exam"><Link className="back-link" to={returnToStudy || "/student"}>{returnToStudy ? "بازگشت به مطالعه" : "بازگشت به پنل"}</Link><PageHeader eyebrow="سنجش مسیر" title={kind === 'diagnostic' ? 'آزمون تعیین سطح' : kind === 'practice' ? 'تمرین مبحث' : 'آزمون شبیه‌ساز'} description="نتیجه از پاسخ‌ها و کلید پاسخ سرور محاسبه می‌شود."/>{error && <p className="inline-error" role="alert">{error}</p>}{!attempt ? <section className="card cent-admin-panel"><h2>با آرامش شروع کن</h2><label className="cent-section-select">درس<select aria-label="انتخاب درس" value={course} onChange={e => { setCourse(e.target.value); setTopic(''); requestId.current = crypto.randomUUID() }}><option value="">همه درس‌ها</option>{catalog.data?.courses.map(c => <option key={c.code} value={c.code}>{c.title}</option>)}</select></label><label className="cent-section-select">مبحث<select aria-label="انتخاب مبحث" value={topic} onChange={e => { setTopic(e.target.value); requestId.current = crypto.randomUUID() }}><option value="">همه مباحث</option>{catalog.data?.topics.filter(t => !course || t.courseCode === course).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label><LoadState {...catalog} retry={catalog.reload}/><p>برای هر تلاش ۶۰ دقیقه زمان داری. پاسخ‌ها تا زمان ثبت در همین مرورگر حفظ می‌شوند. شبیه‌ساز به اشتراک فعال نیاز دارد.</p><button className="button button-primary" disabled={busy} onClick={start}>{busy ? 'در حال آماده‌سازی…' : 'شروع آزمون'}<ArrowLeft size={16}/></button></section> : question && <><div className="cent-exam-status"><span>سؤال {index + 1} از {attempt.questions.length}</span><span><Clock3 size={16}/> {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span></div><ProgressBar value={100 * Object.keys(answers).length / attempt.questions.length}/><div className="cent-exam-dots">{attempt.questions.map((q, i) => <button className={i === index ? 'active' : answers[q.id] != null ? 'answered' : ''} key={q.id} onClick={() => setIndex(i)}>{i + 1}</button>)}</div><section className="card sim-question"><span className="eyebrow">{question.topic}</span><span className="cent-tag">{({ easy: 'آسان', medium: 'متوسط', hard: 'سخت' })[question.difficulty]}</span><h2 dir="auto">{question.text}</h2>{question.figureSvg && <img className="cent-question-figure" alt="شکل سؤال" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(question.figureSvg)}`}/>}<div className="options-list">{question.options.map((option, i) => <button key={i} disabled={busy || remaining <= 0} className={answers[question.id] === i ? 'selected' : ''} onClick={() => setAnswers(a => ({ ...a, [question.id]: i }))}><span>{['الف', 'ب', 'ج', 'د', 'هـ', 'و'][i]}</span><b dir="auto">{option}</b></button>)}</div><div className="question-actions"><button className="button button-ghost" disabled={index <= 0} onClick={() => setIndex(i => i - 1)}><ArrowRight size={16}/> قبلی</button><button className="button button-ghost" onClick={() => setAnswers(a => ({ ...a, [question.id]: null }))}>پاک‌کردن پاسخ</button>{index < attempt.questions.length - 1 ? <button className="button button-secondary" onClick={() => setIndex(i => i + 1)}>بعدی <ArrowLeft size={16}/></button> : <button className="button button-primary" disabled={busy || remaining <= 0} onClick={submit}>{busy ? 'در حال ثبت…' : 'ثبت و دیدن نتیجه'}</button>}</div>{remaining <= 0 && <p className="notice">زمان آزمون پایان یافته است. <button className="button button-ghost" onClick={() => { sessionStorage.removeItem(storageKey); requestId.current = crypto.randomUUID(); setAttempt(null) }}>آزمون تازه</button></p>}</section></>}</div>
}

export function CentResultsPage() {
  return <PersonalResults/>
}

export function CentResultPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const returnToStudy = studyReturnPath(params.get('returnTo'))
  const fetcher = useCallback<() => Promise<ExamOutcome>>(() => cent.outcome(id), [id])
  const remote = useRemote(fetcher)
  const outcome = remote.data
  return <><PageHeader title="گزارش آزمون" action={<Link className="button button-secondary" to="/student/results">همه نتایج</Link>}/><LoadState {...remote} retry={remote.reload}/>{outcome && <><div className="stats-grid"><StatCard label="درصد کل" value={`${outcome.result.percentage}٪`} icon={<Target/>}/><StatCard label="صحیح" value={outcome.result.correct} icon={<CheckCircle2/>}/><StatCard label="نادرست" value={outcome.result.incorrect} icon={<ArrowLeft/>}/><StatCard label="بدون پاسخ" value={outcome.result.unanswered} icon={<Clock3/>}/></div><section className="card cent-admin-panel"><h2>قدم بعدی تو</h2><p>{outcome.analysis.suggestedNextStep}</p><div className="cent-tag-row">{outcome.analysis.priorityTopics.map(t => <span className="cent-tag" key={t}>{t}</span>)}</div><p className="muted-text">{outcome.analysis.personalizedExplanation}</p><Link className="button button-primary" to={returnToStudy || "/student/content"}>{returnToStudy ? "بازگشت به مطالعه" : "رفتن به مطالعه"}</Link></section><div className="cent-admin-columns"><section className="card cent-admin-panel"><h2>عملکرد موضوعی</h2><Link className="text-link" to="/student/analysis">نقشه یادگیری و تسلط همه مباحث</Link>{Object.entries(outcome.result.byTopic).map(([topic, result]) => <div className="chapter-progress" key={topic}><div><b>{topic}</b><span>{result.correct} از {result.total}</span></div><strong>{result.percentage}٪</strong><ProgressBar value={result.percentage}/></div>)}</section><section className="card cent-admin-panel"><h2>مرور پاسخ‌ها</h2>{outcome.review.map((q, i) => <details className="cent-answer-review" key={q.id}><summary>سؤال {i + 1} · {q.topic} · {outcome.result.answers[q.id] == null ? 'بی‌پاسخ' : outcome.result.answers[q.id] === q.correctAnswer ? 'صحیح' : 'نادرست'}</summary><p>گزینه صحیح: {q.correctAnswer + 1}</p><p dir="auto">{q.explanation}</p></details>)}</section></div></>}</>
}

export function CentSimulatorsPage() {
  const { hasPackage } = useAppState()
  return <><PageHeader title="آزمون شبیه‌ساز" description="بعد از مطالعه، خودت را دوباره بسنج."/><section className="card cent-admin-panel"><h2>مرور ترکیبی درس‌ها</h2><p>آزمون از سؤال‌های منتشرشده ساخته می‌شود و گزارش موضوعی آن در حساب شما باقی می‌ماند.</p><Link className="button button-primary" to={hasPackage ? '/student/simulators/test' : '/package'}>{hasPackage ? 'شروع شبیه‌ساز' : 'انتخاب اشتراک مطالعه'}<ArrowLeft size={16}/></Link></section></>
}
