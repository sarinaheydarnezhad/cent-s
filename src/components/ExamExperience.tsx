import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock3, ListChecks } from 'lucide-react'
import type { Curriculum, ExamAttempt } from '../services/cent'
import type { AnswerMap } from '../types'
import { LoadState } from './CentUI'
import { AppearanceControl } from './AppearanceControl'
import { AssessmentHero, AssessmentSkeleton, TopicLabel } from './AssessmentUI'
import { Badge, Notice, ProgressBar } from './UI'

export function ExamExperience({ kind, returnToStudy, catalog, course, setCourse, topic, setTopic, configurationChanged, attempt, answers, setAnswers, index, setIndex, busy, error, remaining, start, submit, restart }: {
  kind: 'diagnostic' | 'practice' | 'simulator'; returnToStudy: string | null; catalog: { data: Curriculum | null; busy: boolean; error: string; reload: () => void };
  course: string; setCourse: Dispatch<SetStateAction<string>>; topic: string; setTopic: Dispatch<SetStateAction<string>>; configurationChanged: () => void;
  attempt: ExamAttempt | null; answers: AnswerMap; setAnswers: Dispatch<SetStateAction<AnswerMap>>; index: number; setIndex: Dispatch<SetStateAction<number>>;
  busy: boolean; error: string; remaining: number; start: () => void; submit: () => void; restart: () => void;
}) {
  const title = kind === 'diagnostic' ? 'آزمون تعیین سطح' : kind === 'practice' ? 'تمرین مبحث' : 'آزمون شبیه‌ساز'
  const question = attempt?.questions[index]
  const passage = question?.passageId ? attempt?.passages?.find(p => p.id === question.passageId) : null
  const missingPassage = Boolean(question?.passageId && !passage)
  const availableCourses = catalog.data?.courses.filter(c => kind === 'practice' || c.supportsLegacyAssessment !== false)
  const availableTopics = catalog.data?.topics.filter(t => (!course || t.courseCode === course) && (kind === 'practice' || t.contentContract !== 'passage-v1'))
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (question) heading.current?.focus({ preventScroll: true }) }, [question])
  return <div className={`container cent-exam assessment-page${attempt ? ' assessment-active' : ''}`}>
    <div className="assessment-topline"><Link className="back-link" to={returnToStudy || '/student'}>{returnToStudy ? 'بازگشت به مطالعه' : 'بازگشت به پنل'}</Link>{kind === 'diagnostic' && <AppearanceControl/>}</div>
    {!attempt ? <><AssessmentHero title={title} description="درس و مبحثت رو انتخاب کن؛ بعد از ثبت پاسخ‌ها، نتیجه و پیشنهاد ادامه رو می‌بینی."/>
      {error && <Notice tone="error" live="assertive">{error}</Notice>}
      <section className="card assessment-setup"><div><h2>با آرامش شروع کن</h2><div className="assessment-config"><label className="cent-section-select">درس<select aria-label="انتخاب درس" value={course} onChange={e => { setCourse(e.target.value); setTopic(''); configurationChanged() }}><option value="">همه درس‌ها</option>{availableCourses?.map(c => <option key={c.code} value={c.code}>{c.title}</option>)}</select></label><label className="cent-section-select">مبحث<select aria-label="انتخاب مبحث" value={topic} onChange={e => { setTopic(e.target.value); configurationChanged() }}><option value="">همه مباحث</option>{availableTopics?.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label></div>
        {catalog.busy ? <AssessmentSkeleton label="در حال دریافت گزینه‌های آزمون…"/> : <LoadState {...catalog} retry={catalog.reload}/>}
        <button className="button button-primary" disabled={busy} aria-busy={busy} onClick={start}>{busy ? 'در حال آماده‌سازی…' : 'شروع آزمون'}</button>
      </div><aside className="assessment-instructions"><h3>پیش از شروع</h3><p><Clock3 aria-hidden="true"/> برای هر تلاش، حداکثر ۶۰ دقیقه زمان داری.</p><p><ListChecks aria-hidden="true"/> تعداد سؤال‌ها بعد از آماده شدن آزمون مشخص می‌شه.</p><p>می‌تونی بین سؤال‌ها جابه‌جا بشی یا پاسخت رو پاک کنی. نتیجه بعد از ثبت پاسخ‌ها نمایش داده می‌شه.</p><p>پاسخ‌ها تا زمان ثبت، در همین مرورگر حفظ می‌شن.</p>{kind === 'simulator' && <p>شبیه‌ساز به اشتراک فعال نیاز داره.</p>}</aside></section></> : question && <>
      <div className="assessment-session-head"><h1>{title}</h1><div className="cent-exam-status"><span>سؤال {index + 1} از {attempt.questions.length}</span><span className="assessment-timer" aria-label="زمان باقی‌مانده"><Clock3 size={18} aria-hidden="true"/><bdi dir="ltr">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</bdi></span></div></div>
      {error && <Notice tone="error" live="assertive">{error}</Notice>}
      <ProgressBar tone="action" label="پاسخ‌های آزمون" value={100 * Object.keys(answers).length / attempt.questions.length}/>
      <div className="assessment-taking-layout"><nav className="assessment-question-map" aria-label="جابه‌جایی بین سؤال‌ها"><h2>سؤال‌های آزمون</h2><p>نشانه ✓ یعنی پاسخی انتخاب شده.</p><div className="cent-exam-dots">{attempt.questions.map((q, i) => <button aria-label={`سؤال ${i + 1}${answers[q.id] != null ? '، پاسخ انتخاب شده' : ''}`} aria-current={i === index ? 'step' : undefined} className={i === index ? 'active' : answers[q.id] != null ? 'answered' : ''} key={q.id} onClick={() => setIndex(i)}>{i + 1}{answers[q.id] != null && <Check size={12} aria-hidden="true"/>}</button>)}</div></nav>
        <section className="card sim-question" aria-labelledby="assessment-question-title"><div className="assessment-question-meta"><TopicLabel value={question.topic} curriculum={catalog.data}/><Badge>{({ easy: 'آسان', medium: 'متوسط', hard: 'سخت' })[question.difficulty]}</Badge></div>
          {passage && <section aria-label="متن مرتبط با سؤال" lang="en" dir="ltr">{passage.text.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>}
          {missingPassage ? <Notice tone="error" live="assertive">متن مرتبط با این سؤال دریافت نشده است. تمرین را دوباره بارگذاری کن.</Notice> : <><h2 ref={heading} tabIndex={-1} id="assessment-question-title" dir="auto">{question.text}</h2>{question.figureSvg && <img className="cent-question-figure" alt="شکل سؤال" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(question.figureSvg)}`}/>}
          <div className="options-list" lang={attempt.contentContract === 'passage-v1' ? 'en' : undefined} dir={attempt.contentContract === 'passage-v1' ? 'ltr' : undefined} role="group" aria-labelledby="assessment-question-title">{question.options.map((option, i) => <button key={i} aria-pressed={answers[question.id] === i} disabled={busy || remaining <= 0} className={answers[question.id] === i ? 'selected' : ''} onClick={() => setAnswers(a => ({ ...a, [question.id]: i }))}><span>{attempt.contentContract === 'passage-v1' ? String.fromCharCode(65 + i) : ['الف', 'ب', 'ج', 'د', 'هـ', 'و'][i] || i + 1}</span><b dir="auto">{option}</b><Check aria-hidden="true"/></button>)}</div></>}
          <div className="question-actions"><button className="button button-ghost" disabled={index <= 0} onClick={() => setIndex(i => i - 1)}>قبلی</button><button className="button button-ghost" onClick={() => setAnswers(a => ({ ...a, [question.id]: null }))}>پاک‌کردن پاسخ</button>{index < attempt.questions.length - 1 ? <button className="button button-secondary" onClick={() => setIndex(i => i + 1)}>بعدی</button> : <button className="button button-primary" disabled={busy || remaining <= 0} aria-busy={busy} onClick={submit}>{busy ? 'در حال ثبت…' : 'ثبت و دیدن نتیجه'}</button>}</div>
          {remaining <= 0 && <Notice tone="warning">زمان آزمون پایان یافته است. <button className="button button-ghost" onClick={restart}>آزمون تازه</button></Notice>}
        </section></div>
    </>}
  </div>
}
