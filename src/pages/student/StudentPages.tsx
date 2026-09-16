import { ArrowLeft, BarChart3, BookOpen, BrainCircuit, CalendarDays, CheckCircle2, ChevronLeft, Clock3, Flame, LockKeyhole, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { EmptyState, PageHeader, ProgressBar, StatCard } from '../../components/UI'
import { chapters } from '../../data/content'
import { simulatorQuestions, subjectLabels } from '../../data/questions'
import { useAppState } from '../../state/AppState'
import { scoreAttempt } from '../../services/scoring'
import type { AnswerMap, DiagnosticResult } from '../../types'

export function StudentDashboardPage() {
  const { diagnosticResult, aiAnalysis, hasPackage } = useAppState()
  const recommendation = aiAnalysis?.suggestedNextStep || 'برای ساخت اولین پیشنهاد مطالعه، تعیین سطح را انجام بده.'
  return <>
    <PageHeader eyebrow="نمای کلی" title="داشبورد آمادگی" description="مهم‌ترین اقدام امروزت را اینجا می‌بینی." action={<Link className="button button-primary" to={diagnosticResult ? '/student/preparation' : '/diagnostic/intro'}>{diagnosticResult ? 'ادامه مطالعه' : 'شروع ارزیابی'} <ArrowLeft/></Link>} />
    <section className="next-action-card"><div className="next-icon"><Target/></div><div><span>پیشنهاد امروز</span><h2>{recommendation}</h2><p>{diagnosticResult ? 'این پیشنهاد بر اساس آخرین تعیین سطح تو ساخته شده است.' : 'اولین نتیجه، مسیر پیشنهادی تو را مشخص می‌کند.'}</p></div><Link to={diagnosticResult ? (hasPackage ? '/student/content' : '/package') : '/diagnostic/intro'} className="round-arrow"><ArrowLeft/></Link></section>
    <div className="stats-grid four"><StatCard label="امتیاز تعیین سطح" value={diagnosticResult ? `${diagnosticResult.percentage}٪` : '—'} note="آخرین تلاش" icon={<BarChart3/>}/><StatCard label="مباحث در حال یادگیری" value={hasPackage ? '۳' : '۰'} note="از ۴ فصل نمونه" icon={<BookOpen/>}/><StatCard label="اشتباه نیازمند مرور" value={diagnosticResult?.incorrect ?? '—'} note="براساس تعیین سطح" icon={<RotateCcw/>}/><StatCard label="زنجیره مطالعه" value="۳ روز" note="داده نمایشی" icon={<Flame/>}/></div>
    <div className="dashboard-grid">
      <section className="card dashboard-panel"><div className="panel-title"><div><h2>مسیر آمادگی</h2><p>پیشرفت فصل‌های پکیج</p></div><Link to="/student/preparation">مشاهده همه</Link></div>{hasPackage ? chapters.slice(0,3).map((chapter) => <div className="chapter-progress" key={chapter.id}><div><b>{chapter.title}</b><span>{chapter.subject}</span></div><strong>{chapter.progress}٪</strong><ProgressBar value={chapter.progress}/></div>) : <EmptyState title="پکیجی فعال نیست" description="برای مشاهده مسیر کامل، پکیج اصلی را فعال کن." action={<Link className="button button-secondary button-small" to="/package">مشاهده پکیج</Link>}/>}</section>
      <section className="card dashboard-panel"><div className="panel-title"><div><h2>آخرین تحلیل</h2><p>خلاصه نقاط قابل توجه</p></div><BrainCircuit/></div>{aiAnalysis ? <><div className="analysis-score"><span>وضعیت کلی</span><b>{diagnosticResult?.percentage}٪</b></div><p className="muted-text">{aiAnalysis.overallAssessment}</p><div className="mini-tag-list">{aiAnalysis.priorityTopics.map((x) => <span key={x}>{x}</span>)}</div><Link className="text-link" to="/student/analysis">مشاهده تحلیل و برنامه <ArrowLeft/></Link></> : <EmptyState title="هنوز تحلیلی نداریم" description="پس از تعیین سطح، نتیجه اینجا نمایش داده می‌شود."/>}</section>
    </div>
  </>
}

export function PreparationPage() {
  const { hasPackage } = useAppState()
  return <><PageHeader eyebrow="برنامه من" title="مسیر آمادگی" description="فصل‌ها را به‌ترتیب پیشنهادی جلو ببر و تمرین را از مطالعه جدا نکن." />
    {!hasPackage && <div className="notice lock-notice"><LockKeyhole/><div><b>نمایش محدود نسخه رایگان</b><p>ساختار فصل‌ها قابل مشاهده است؛ برای ورود به درس‌ها پکیج دمو را فعال کن.</p></div><Link className="button button-primary button-small" to="/package">مشاهده پکیج</Link></div>}
    <div className="path-list">{chapters.map((chapter, index) => <article className="card path-card" key={chapter.id}><div className="path-index">{index + 1}</div><div className="path-info"><span>{chapter.subject}</span><h2>{chapter.title}</h2><p>{chapter.lessons.length} درس · تمرین پایان فصل</p><ProgressBar value={hasPackage ? chapter.progress : 0}/></div><div className="path-action"><strong>{hasPackage ? chapter.progress : 0}٪</strong>{hasPackage ? <Link to={`/student/content#${chapter.id}`}><ChevronLeft/></Link> : <LockKeyhole/>}</div></article>)}</div></>
}

export function MyResultsPage() {
  const { diagnosticResult } = useAppState()
  if (!diagnosticResult) return <><PageHeader title="نتایج من"/><EmptyState title="هنوز نتیجه‌ای ثبت نشده" description="اولین تعیین سطح را انجام بده تا عملکردت ثبت شود." action={<Link className="button button-primary" to="/diagnostic/intro">شروع تعیین سطح</Link>}/></>
  return <><PageHeader eyebrow="عملکرد" title="نتایج من" description="نمره‌ها از پاسخ‌ها محاسبه شده‌اند و توسط AI تغییر نمی‌کنند." />
    <div className="stats-grid"><StatCard label="درصد کل" value={`${diagnosticResult.percentage}٪`} icon={<Trophy/>}/><StatCard label="پاسخ صحیح" value={diagnosticResult.correct} icon={<CheckCircle2/>}/><StatCard label="پاسخ نادرست" value={diagnosticResult.incorrect} icon={<RotateCcw/>}/><StatCard label="بدون پاسخ" value={diagnosticResult.unanswered} icon={<Clock3/>}/></div>
    <section className="card dashboard-panel result-table"><h2>جزئیات موضوعی</h2>{Object.entries(diagnosticResult.byTopic).map(([topic, value]) => <div className="result-table-row" key={topic}><div><b>{topic}</b><span>{subjectLabels[value.subject]}</span></div><span>{value.correct} از {value.total} صحیح</span><strong>{value.percentage}٪</strong><ProgressBar value={value.percentage} tone={value.percentage >= 70 ? 'success' : value.percentage >= 50 ? 'warning' : 'danger'}/></div>)}</section></>
}

export function StudentAnalysisPage() {
  const { aiAnalysis, diagnosticResult } = useAppState()
  if (!aiAnalysis || !diagnosticResult) return <><PageHeader title="تحلیل شخصی"/><EmptyState title="تحلیل آماده نیست" description="برای ساخت تحلیل و برنامه، ابتدا تعیین سطح را کامل کن." action={<Link className="button button-primary" to="/diagnostic/intro">شروع تعیین سطح</Link>}/></>
  const priorities = aiAnalysis.priorityTopics.length ? aiAnalysis.priorityTopics : ['جبر','استدلال شرطی','احتمال']
  const studyPlan = [
    { day: 'شنبه', focus: priorities[0] || 'جبر', task: 'درس‌نامه کوتاه + ۸ تمرین', time: '۴۵ دقیقه', tone: 'primary' },
    { day: 'یکشنبه', focus: priorities[1] || 'منطق', task: 'مرور مفهوم + تحلیل خطاها', time: '۳۵ دقیقه', tone: 'warning' },
    { day: 'دوشنبه', focus: 'مرور ترکیبی', task: '۱۲ سؤال زمان‌دار', time: '۳۰ دقیقه', tone: 'success' },
    { day: 'سه‌شنبه', focus: priorities[2] || 'احتمال', task: 'مثال حل‌شده + تمرین هدفمند', time: '۴۰ دقیقه', tone: 'primary' },
  ]
  return <><PageHeader eyebrow="تحلیل هوشمند" title="تحلیل شخصی و برنامه درسی" description={`نسخه دمو تولیدشده توسط ${aiAnalysis.provider === 'openrouter' ? 'OpenRouter' : aiAnalysis.provider === 'mock' ? 'Mock AI' : 'Fallback محلی'}`} />
    <section className="card analysis-detail"><div className="analysis-lead"><BrainCircuit/><div><h2>ارزیابی کلی</h2><p>{aiAnalysis.overallAssessment}</p></div></div><div className="analysis-two-col"><div><h3>نقاط قوت</h3><ul className="clean-list good">{aiAnalysis.strengths.map((x)=><li key={x}>{x}</li>)}</ul></div><div><h3>اولویت‌های بهبود</h3><ul className="clean-list bad">{aiAnalysis.weaknesses.map((x)=><li key={x}>{x}</li>)}</ul></div></div><div className="priority-box"><Target/><div><b>اقدام پیشنهادی</b><p>{aiAnalysis.suggestedNextStep}</p></div></div><p className="analysis-explain">{aiAnalysis.personalizedExplanation}</p></section>
    <section className="study-plan-section"><div className="study-plan-head"><div><span><Sparkles/> برنامه پیشنهادی هوش مصنوعی</span><h2>برنامه چهارروزه شروع مطالعه</h2><p>این برنامه نمونه است و در نسخه متصل، با زمان آزاد، تاریخ آزمون و عملکرد هر هفته بازتنظیم می‌شود.</p></div><div className="plan-summary"><b>۲ ساعت و ۳۰ دقیقه</b><small>زمان پیشنهادی این دوره</small></div></div><div className="study-plan-grid">{studyPlan.map((item,index)=><article className="card study-day" key={item.day}><div className={`study-day-index ${item.tone}`}>{index+1}</div><div><span>{item.day}</span><h3>{item.focus}</h3><p>{item.task}</p></div><em><Clock3/>{item.time}</em></article>)}</div><div className="plan-footer"><CalendarDays/><div><b>پس از پایان این برنامه</b><p>یک آزمون کوتاه مرور برگزار می‌شود و AI برنامه مرحله بعد را براساس نتیجه به‌روزرسانی می‌کند.</p></div><button className="button button-primary">افزودن به برنامه من</button></div></section></>
}

export function PackageContentPage() {
  const { hasPackage } = useAppState()
  if (!hasPackage) return <><PageHeader title="محتوای پکیج"/><div className="locked-content card"><LockKeyhole/><h2>این بخش هنوز قفل است.</h2><p>برای دیدن درس‌ها و تمرین‌های نمونه، خرید آزمایشی را کامل کن. هیچ پرداخت واقعی انجام نمی‌شود.</p><Link className="button button-primary" to="/package">مشاهده پکیج</Link></div></>
  return <><PageHeader eyebrow="پکیج فعال" title="محتوای آمادگی" description="چهار فصل نمونه برای نمایش معماری محتوا و مسیر مطالعه." action={<Link className="button button-primary" to="/student/simulators">آزمون شبیه‌ساز <ArrowLeft/></Link>} />
    <div className="content-chapters">{chapters.map((chapter) => <section className="card content-chapter" id={chapter.id} key={chapter.id}><div className="content-chapter-head"><div><span>{chapter.subject}</span><h2>{chapter.title}</h2></div><strong>{chapter.progress}٪</strong></div><ProgressBar value={chapter.progress}/><div className="lesson-list">{chapter.lessons.map((lesson, lessonIndex) => <button key={lesson}><span className={chapter.progress > lessonIndex * 30 ? 'done' : ''}>{chapter.progress > lessonIndex * 30 ? <CheckCircle2/> : lessonIndex + 1}</span><div><b>{lesson}</b><small>{lessonIndex === 0 ? 'درس‌نامه و مثال حل‌شده' : 'درس‌نامه کوتاه و تمرین'}</small></div><ChevronLeft/></button>)}</div></section>)}</div>
  </>
}

export function SimulatorsPage() {
  const { hasPackage } = useAppState()
  if (!hasPackage) return <Navigate to="/student/content" replace />
  return <><PageHeader eyebrow="تمرین در شرایط آزمون" title="آزمون‌های شبیه‌ساز" description="نسخه دمو شامل یک آزمون ترکیبی کوتاه است." />
    <div className="simulator-grid"><article className="card simulator-card active"><div className="simulator-cover"><span>SIM 01</span><Trophy/></div><div><span className="status-chip">آماده شروع</span><h2>شبیه‌ساز ترکیبی شماره ۱</h2><p>۸ سؤال منتخب ریاضیات و منطق با گزارش موضوعی.</p><div className="simulator-meta"><span><Clock3/> ۱۵ دقیقه پیشنهادی</span><span><BookOpen/> دو درس</span></div><Link className="button button-primary button-block" to="/student/simulators/test">شروع شبیه‌ساز <ArrowLeft/></Link></div></article><article className="card simulator-card disabled"><div className="simulator-cover"><span>SIM 02</span><LockKeyhole/></div><div><span className="status-chip muted">به‌زودی</span><h2>شبیه‌ساز ترکیبی شماره ۲</h2><p>در نسخه بعدی محتوای بیشتری به بانک آزمون اضافه می‌شود.</p></div></article></div></>
}

export function SimulatorTestPage() {
  const { hasPackage } = useAppState()
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  if (!hasPackage) return <Navigate to="/student/content" replace />
  const q = simulatorQuestions[index]
  function finish() {
    const result = scoreAttempt(simulatorQuestions, answers)
    localStorage.setItem('cents:simulator-result', JSON.stringify(result))
    navigate('/student/simulators/result', { state: { result } })
  }
  return <div className="sim-test"><div className="sim-test-header"><div><span>شبیه‌ساز شماره ۱</span><b>سؤال {index+1} از {simulatorQuestions.length}</b></div><span>{subjectLabels[q.subject]} · {q.topic}</span></div><ProgressBar value={((index+1)/simulatorQuestions.length)*100}/><section className="card sim-question"><h1>{q.text}</h1><div className="options-list">{q.options.map((option, i) => <button key={option} className={answers[q.id] === i ? 'selected' : ''} onClick={() => setAnswers({...answers,[q.id]:i})}><span>{['الف','ب','ج','د'][i]}</span><b>{option}</b></button>)}</div><div className="question-actions"><button className="button button-ghost" disabled={index===0} onClick={()=>setIndex(index-1)}>سؤال قبل</button>{index < simulatorQuestions.length-1 ? <button className="button button-primary" onClick={()=>setIndex(index+1)}>سؤال بعد <ArrowLeft/></button> : <button className="button button-primary" onClick={finish}>ثبت و دیدن نتیجه</button>}</div></section></div>
}

export function SimulatorResultPage() {
  const location = useLocation()
  const result = useMemo(() => {
    const stateResult = (location.state as { result?: DiagnosticResult } | null)?.result
    if (stateResult) return stateResult
    try { return JSON.parse(localStorage.getItem('cents:simulator-result') || '') as DiagnosticResult } catch { return null }
  }, [location.state])
  if (!result) return <Navigate to="/student/simulators" replace />
  const weakest = Object.entries(result.byTopic).sort((a,b)=>a[1].percentage-b[1].percentage)[0]?.[0]
  return <><PageHeader eyebrow="نتیجه شبیه‌ساز" title="گزارش آزمون شماره ۱" description="این نتیجه از پاسخ‌های همین شبیه‌ساز محاسبه شده است." />
    <div className="stats-grid"><StatCard label="درصد کل" value={`${result.percentage}٪`} icon={<Trophy/>}/><StatCard label="ریاضیات" value={`${result.bySubject.math.percentage}٪`} icon={<BarChart3/>}/><StatCard label="منطق" value={`${result.bySubject.logic.percentage}٪`} icon={<BrainCircuit/>}/><StatCard label="بدون پاسخ" value={result.unanswered} icon={<Clock3/>}/></div>
    <section className="card simulator-recommendation"><Sparkles/><div><span>تمرین پیشنهادی بعدی</span><h2>{weakest ? `تقویت مبحث «${weakest}»` : 'مرور ترکیبی سطح متوسط'}</h2><p>در معماری آینده، این داده به QuestionGenerationService ارسال می‌شود؛ اکنون MockQuestionGenerator سؤال‌های موجود را بر اساس ضعف انتخاب می‌کند.</p></div></section>
    <div className="result-columns"><section className="card topic-performance"><h2>عملکرد موضوعی</h2>{Object.entries(result.byTopic).map(([topic,value])=><div className="topic-row" key={topic}><div><b>{topic}</b><span>{subjectLabels[value.subject]}</span></div><strong>{value.percentage}٪</strong><ProgressBar value={value.percentage}/></div>)}</section><section className="card answer-review"><h2>مرور پاسخ‌ها</h2>{simulatorQuestions.map((q,i)=>{const answer=result.answers[q.id];const correct=answer===q.correctAnswer;return <details key={q.id}><summary><span className={correct?'correct':'wrong'}>{correct?'صحیح':answer==null?'بی‌پاسخ':'نادرست'}</span><b>سؤال {i+1}: {q.topic}</b></summary><p>{q.explanation}</p></details>})}</section></div>
    <div className="page-actions"><Link className="button button-secondary" to="/student/simulators">بازگشت به شبیه‌سازها</Link><Link className="button button-primary" to="/student/content">مرور محتوا <ArrowLeft/></Link></div></>
}

export function ProfilePage() {
  const { user, orders } = useAppState()
  return <><PageHeader eyebrow="حساب دمو" title="پروفایل من" description="اطلاعات این صفحه نمونه است و احراز هویت تولیدی نیست." /><div className="profile-grid"><section className="card profile-card"><div className="large-avatar">{user?.name.slice(0,1)}</div><h2>{user?.name}</h2><span dir="ltr">{user?.email}</span><div className="profile-fields"><label>هدف فعلی<input value="آمادگی CEnT-S" readOnly/></label><label>تاریخ هدف<input value="هنوز مشخص نشده" readOnly/></label></div></section><section className="card dashboard-panel"><h2>سفارش‌های من</h2>{orders.length ? orders.map((order)=><div className="profile-order" key={order.id}><div><b>{order.product}</b><span>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</span></div><strong>{order.status === 'PAID' ? 'فعال' : order.status}</strong></div>) : <EmptyState title="سفارشی وجود ندارد" description="خرید آزمایشی تو پس از ثبت اینجا دیده می‌شود."/>}</section></div></>
}
