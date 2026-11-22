import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { AssessmentHero } from '../components/AssessmentUI'
import { Badge, Button, Card, Notice } from '../components/UI'
import { mockExams, mockStartIdentity, mockStorage, mockSubjects, MockSession, terminalMock, type MockConfiguration, type MockContent, type MockCounts, type MockReview, type MockState } from '../services/mock-exams'
import { dateFa } from '../services/cent'

export function MockExamsPage() {
  const versions = useRemote(mockExams.versions)
  const [configuration, setConfiguration] = useState<MockConfiguration | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const { user } = useAppState()
  const navigate = useNavigate()
  async function configure(id: string) {
    setBusy(true); setError(''); setConfiguration(null); setConsent(false)
    try { setConfiguration(await mockExams.configuration(id)) } catch { setError('دریافت شرایط آزمون ممکن نشد؛ دوباره تلاش کنید.') } finally { setBusy(false) }
  }
  async function start() {
    if (!configuration || !consent || !user) return
    setBusy(true); setError('')
    try {
      const identity = mockStartIdentity(user.id, configuration, mockStorage)
      const state = await mockExams.start(identity.input)
      mockStorage.removeItem(identity.key)
      navigate(`/student/mock-exams/${state.attemptId}`)
    } catch { setError('شروع آزمون تأیید نشد. برای ادامه همان درخواست دوباره تلاش کنید؛ دسترسی و آمادگی محتوا در سرور بررسی می‌شود.') }
    finally { setBusy(false) }
  }
  return <div className="assessment-page"><AssessmentHero title="آزمون جامع با قالب رسمی" description="آزمون تمرینی Itatest با شش بخش، ۶۵ سؤال و مجموع ۱۴۰ دقیقه؛ نمره، خام و آموزشی است."/>
    <LoadState {...versions} retry={versions.reload}/>
    {error && <Notice tone="error" live="assertive">{error}</Notice>}
    <Card className="assessment-panel"><h2>انتخاب آزمون</h2>
      {versions.data?.versions.filter(v => v.totalQuestions === 65 && v.totalDurationSeconds === 8400).map(v => <p key={v.examVersionId}><Button variant="secondary" disabled={busy} onClick={() => void configure(v.examVersionId)}>{v.label} · مشاهده شرایط</Button> {!v.availableForNewStarts && <Badge tone="neutral">شروع هنوز فعال نشده است</Badge>}</p>)}
      {versions.data && !versions.data.versions.some(v => v.totalQuestions === 65 && v.totalDurationSeconds === 8400) && <p>آزمون جدید هنوز برای شروع منتشر نشده است. تلاش‌های قبلی از تاریخچه در دسترس‌اند.</p>}
      {configuration && <><h3>شرایط آزمون</h3><ol>{configuration.sections.map(s => <li key={s.sectionKey}>{mockSubjects[s.subjectId] || s.subjectId}: {s.questionCount} سؤال · {s.durationSeconds / 60} دقیقه</li>)}</ol>
        <ul><li>هر سؤال پنج گزینه و یک پاسخ صحیح دارد.</li><li>هر بخش زمان مستقل دارد؛ بازگشت به بخش بسته‌شده و انتقال زمان باقی‌مانده ممکن نیست.</li><li>با پایان زمان، سرور بخش بعدی را آغاز می‌کند؛ بستن مرورگر یا قطع ارتباط زمان را متوقف نمی‌کند.</li><li>برای هر پاسخ منتظر تأیید ذخیره بمانید. پاسخ تأییدنشده را دوباره ثبت کنید.</li><li>صحیح: ۱+؛ نادرست: ۰٫۲۵−؛ بدون پاسخ: صفر. کلید و توضیح پس از پایان کل آزمون نمایش داده می‌شوند.</li></ul>
        {!configuration.availableForNewStarts && <Notice tone="warning">شروع این نسخه تا تأیید محتوا، دسترسی و آماده‌سازی سرویس فعال نیست.</Notice>}
        <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/> شرایط زمان‌بندی و بسته‌شدن قطعی بخش‌ها را خوانده‌ام.</label>
        <p><Button disabled={busy || !consent || !configuration.availableForNewStarts} loading={busy} onClick={() => void start()}>شروع آزمون جامع</Button></p>
      </>}
    </Card><MockHistory/>
  </div>
}

export function MockHistory() {
  const remote = useRemote(mockExams.history)
  const [extra, setExtra] = useState<MockState[]>([])
  const [cursor, setCursor] = useState<string | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const next = cursor === undefined ? remote.data?.nextCursor : cursor
  const rows = [...new Map([...(remote.data?.items || []), ...extra].map(row => [row.attemptId, row])).values()]
  async function more() {
    if (!next) return
    setBusy(true); setError('')
    try { const page = await mockExams.history(next); setExtra(previous => [...previous, ...page.items]); setCursor(page.nextCursor) }
    catch { setError('دریافت ادامه تاریخچه ممکن نشد؛ دوباره تلاش کنید.') } finally { setBusy(false) }
  }
  return <section className="card assessment-panel"><h2>تاریخچه آزمون‌های جامع</h2><p>این تلاش‌ها از تعیین سطح و تمرین‌های قبلی جدا هستند و نمره تراز رسمی CISIA ندارند.</p>
    <LoadState {...remote} retry={remote.reload}/>{error && <Notice tone="error">{error}</Notice>}
    {remote.data && rows.length === 0 && <p>هنوز آزمون جامعی شروع نکرده‌اید.</p>}
    {rows.map(row => <article className="assessment-breakdown" key={row.attemptId}><p>{row.examVersionId} · {terminalMock(row) ? (row.status === 'EXPIRED' ? 'پایان زمان' : 'پایان‌یافته') : 'در حال انجام'} {row.effectiveEndedAt && dateFa(row.effectiveEndedAt)}</p><Link className="button button-secondary" to={`/student/mock-exams/${row.attemptId}${terminalMock(row) ? '/result' : ''}`}>{terminalMock(row) ? 'مشاهده نتیجه' : 'ادامه آزمون'}</Link></article>)}
    {next && <Button variant="secondary" disabled={busy} onClick={() => void more()}>تاریخچه بیشتر</Button>}
  </section>
}

export function MockAttemptPage() {
  const { id = '' } = useParams()
  const { user } = useAppState()
  // Remount for every account/attempt, so no prior account's content flashes.
  return user ? <MockAttempt key={`${user.id}:${id}`} owner={user.id} id={id}/> : null
}
function MockAttempt({ owner, id }: { owner: string; id: string }) {
  const controller = useMemo(() => new MockSession(owner, id, mockStorage), [owner, id])
  const view = useSyncExternalStore(controller.subscribe, controller.snapshot)
  const [selection, setSelection] = useState({ sectionId: '', index: 0 })
  const [remaining, setRemaining] = useState(0)
  const [online, setOnline] = useState(navigator.onLine)
  const [confirmSection, setConfirmSection] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    void controller.refresh()
    const timer = window.setInterval(() => { setRemaining(controller.remaining()); if (controller.remaining() === 0) void controller.refresh() }, 1000)
    const poll = window.setInterval(() => void controller.refresh(), 5000)
    const reconnect = () => { setOnline(navigator.onLine); void controller.refresh() }
    const offline = () => setOnline(false)
    const visible = () => { if (!document.hidden) reconnect() }
    window.addEventListener('online', reconnect); window.addEventListener('offline', offline); window.addEventListener('focus', reconnect); document.addEventListener('visibilitychange', visible)
    return () => { clearInterval(timer); clearInterval(poll); window.removeEventListener('online', reconnect); window.removeEventListener('offline', offline); window.removeEventListener('focus', reconnect); document.removeEventListener('visibilitychange', visible) }
  }, [controller])
  const state = view.state
  const section = state?.activeSection
  const questionIndex = selection.sectionId === state?.activeSectionId ? Math.min(selection.index, Math.max(0, (view.content?.questions.length || 1) - 1)) : 0
  const setIndex = (index: number) => setSelection({ sectionId: state?.activeSectionId || '', index })
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [questionIndex, section?.sectionId])
  if (state && terminalMock(state) && !view.pending) return <Navigate to={`/student/mock-exams/${id}/result`} replace/>
  const blocked = view.busy || !!view.pending || !online || remaining === 0 || !!view.error
  return <div className="assessment-page cent-exam"><AssessmentHero title="آزمون جامع" description="زمان و پاسخ‌های تأییدشده از سرور دریافت می‌شوند."/>
    {!online && <Notice tone="warning" live="assertive">ارتباط قطع است. زمان آزمون ادامه دارد. پس از اتصال دوباره وضعیت سرور دریافت می‌شود.</Notice>}
    {view.error && <Notice tone="error" live="assertive">{view.error}</Notice>}
    {view.pending && <Notice tone="warning">یک درخواست منتظر تأیید است. تا دریافت تأیید، پاسخ تازه یا تغییر بخش ممکن نیست. <Button variant="secondary" disabled={view.busy || !online} onClick={() => void controller.retry()}>تلاش مجدد برای ثبت</Button></Notice>}
    <p role="status" aria-live="polite">{view.acknowledgment}</p>
    <Button variant="secondary" disabled={view.busy} onClick={() => void controller.refresh()}>همگام‌سازی با سرور</Button>
    {!state && <LoadState busy={view.busy} error="" retry={() => void controller.refresh()}/>}
    {section && <><section className="card assessment-panel"><h2>{mockSubjects[section.subjectId] || section.subjectId}</h2>
      <p role="timer" aria-label="زمان باقی‌مانده بخش" dir="ltr">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>
      {remaining === 0 && <Notice tone="warning">در حال دریافت وضعیت پایان زمان از سرور…</Notice>}
      <ol>{state.sections.map(s => <li key={s.sectionId}>{mockSubjects[s.subjectId] || s.subjectId} · {s.state === 'ACTIVE' ? 'بخش فعال' : s.state === 'PENDING' ? 'شروع نشده' : s.order < section.order ? 'بسته‌شده' : 'شروع نشده'}</li>)}</ol>
    </section>
      {view.content && <><MockQuestionView content={view.content} index={questionIndex} blocked={blocked} heading={heading} answer={option => void controller.send('answer', view.content!.questions[questionIndex].questionId, option)}/>
        <nav aria-label="پیمایش سؤال‌های بخش فعال" className="question-dots">{view.content.questions.map((q, i) => <Button variant={questionIndex === i ? 'primary' : 'secondary'} key={q.questionId} aria-current={questionIndex === i ? 'step' : undefined} aria-label={`سؤال ${i + 1}؛ ${q.selectedOptionId === null ? 'بدون پاسخ' : 'پاسخ ذخیره‌شده'}`} onClick={() => setIndex(i)}>{i + 1}{q.selectedOptionId !== null ? ' ✓' : ''}</Button>)}</nav>
        <div className="assessment-exam-actions"><Button variant="secondary" disabled={questionIndex === 0} onClick={() => setIndex(questionIndex - 1)}>سؤال قبلی</Button><Button variant="secondary" disabled={questionIndex >= view.content.questions.length - 1} onClick={() => setIndex(questionIndex + 1)}>سؤال بعدی</Button></div>
      </>}
      <Button disabled={blocked || !view.content} onClick={() => setConfirmSection(section.sectionId)}>{section.order === state.sections.length ? 'پایان آزمون' : 'پایان این بخش و ادامه'}</Button>
      {confirmSection === section.sectionId && <SectionConfirmation blocked={blocked} unanswered={view.content?.questions.filter(q => q.selectedOptionId === null).length ?? 0} cancel={() => setConfirmSection(null)} confirm={() => { setConfirmSection(null); setIndex(0); void controller.send(section.order === state.sections.length ? 'complete' : 'advance') }}/>}
    </>}
    {state && terminalMock(state) && view.pending && <Link to={`/student/mock-exams/${id}/result`}>مشاهده نتیجه سرور</Link>}
  </div>
}

function SectionConfirmation({ blocked, unanswered, cancel, confirm }: { blocked: boolean; unanswered: number; cancel: () => void; confirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])
  return <dialog ref={dialog} className="card assessment-panel" aria-labelledby="confirm-section-title" onCancel={cancel}><h2 id="confirm-section-title">بسته‌شدن قطعی بخش را تأیید می‌کنید؟</h2><p>بازگشت و انتقال زمان باقی‌مانده ممکن نیست. پاسخ‌های بدون پاسخ: {unanswered}</p><Button variant="destructive" disabled={blocked} onClick={confirm}>تأیید و بستن بخش</Button><Button variant="secondary" autoFocus onClick={cancel}>ادامه پاسخ‌دادن</Button></dialog>
}

export function MockQuestionView({ content, index, blocked, answer, heading }: { content: MockContent; index: number; blocked: boolean; answer: (option: string | null) => void; heading?: React.RefObject<HTMLHeadingElement | null> }) {
  const q = content.questions[index]
  if (!q) return <Notice tone="error">سؤال دریافت نشد؛ همگام‌سازی را دوباره انجام دهید.</Notice>
  const passage = q.passageSnapshotId ? content.passages.find(p => p.passageSnapshotId === q.passageSnapshotId) : null
  if ((q.passageSnapshotId && !passage) || q.media || passage?.media || q.options.length !== 5 || new Set(q.options.map(o => o.id)).size !== 5) return <Notice tone="error">متن یا رسانه لازم برای این سؤال دریافت نشده است. دوباره همگام‌سازی کنید.</Notice>
  return <Card className="assessment-question"><p>سؤال {index + 1} از {content.questions.length}</p>{passage && <section lang="en" dir="ltr" aria-label="متن مرتبط با سؤال">{passage.text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</section>}
    <h2 ref={heading} tabIndex={-1} lang="en" dir="ltr">{q.stem}</h2><div className="options-list" role="group" aria-label="گزینه‌های پاسخ" lang="en" dir="ltr">{q.options.map((o, i) => <button type="button" key={o.id} className={`option ${q.selectedOptionId === o.id ? 'selected' : ''}`} aria-pressed={q.selectedOptionId === o.id} disabled={blocked} onClick={() => answer(o.id)}><span>{String.fromCharCode(65 + i)}</span>{o.text}</button>)}</div><Button variant="secondary" disabled={blocked || q.selectedOptionId === null} onClick={() => answer(null)}>پاک‌کردن پاسخ</Button>
  </Card>
}

export function MockResultPage() {
  const { id = '' } = useParams()
  const fetchResult = useCallback(() => mockExams.result(id), [id])
  const result = useRemote(fetchResult)
  const fetchReview = useCallback(async () => {
    const state = await mockExams.state(id)
    if (!terminalMock(state)) throw new Error('مرور پاسخ‌ها پس از پایان آزمون در دسترس است.')
    return mockExams.review(id)
  }, [id])
  const review = useRemote(fetchReview)
  return <div className="assessment-page"><AssessmentHero title="نتیجه آزمون جامع" description="نمره خام Itatest؛ این نمره تراز یا نمره نرمال‌شده رسمی CISIA نیست."/>
    <Link className="button button-secondary" to="/student/mock-exams">آزمون‌ها و تاریخچه</Link>
    <LoadState {...result} retry={result.reload}/>
    {result.data && <><Card className="assessment-panel"><h2>{result.data.status === 'EXPIRED' ? 'پایان زمان آزمون' : 'آزمون پایان یافت'}</h2><MockMetrics counts={result.data}/><p>صحیح ۱+، نادرست ۰٫۲۵−، بدون پاسخ صفر. فرم‌های تمرینی کالیبره نشده‌اند.</p></Card><section className="card assessment-panel"><h2>عملکرد هر درس</h2>{result.data.sections.map(s => <article className="assessment-breakdown" key={s.sectionId}><h3>{mockSubjects[s.subjectId] || s.subjectId}</h3><MockMetrics counts={s.counts}/></article>)}</section></>}
    <section className="card assessment-panel"><h2>مرور سؤال‌ها و توضیح پاسخ</h2><LoadState {...review} retry={review.reload}/>{review.data && <MockReviewView review={review.data}/>}</section>
  </div>
}
export function MockMetrics({ counts }: { counts: MockCounts }) {
  return <dl className="assessment-metrics"><div><dt>نمره خام</dt><dd dir="ltr">{counts.rawScore ?? '—'} / {counts.maximumRawScore}</dd></div><div><dt>صحیح</dt><dd>{counts.correctCount}</dd></div><div><dt>نادرست</dt><dd>{counts.incorrectCount}</dd></div><div><dt>بدون پاسخ</dt><dd>{counts.unansweredCount}</dd></div><div><dt>دقت در پاسخ‌های ثبت‌شده</dt><dd>{counts.accuracy.displayPercent === null ? '—' : `${counts.accuracy.displayPercent}٪`}</dd></div><div><dt>میزان پاسخ‌گویی</dt><dd>{counts.completionRate.displayPercent === null ? '—' : `${counts.completionRate.displayPercent}٪`}</dd></div></dl>
}
export function MockReviewView({ review }: { review: MockReview }) {
  return <>{review.questions.map(q => {
    const passage = q.passageRevisionId ? review.passages.find(p => p.passageRevisionId === q.passageRevisionId) : null
    return <details className="cent-answer-review assessment-review" key={q.questionId}><summary>سؤال {q.position} · {mockSubjects[q.sectionSubjectId]} · {q.selectedOptionId === null ? 'بدون پاسخ' : q.selectedOptionId === q.correctOptionId ? 'صحیح' : 'نادرست'}</summary>
      {q.passageRevisionId && !passage ? <Notice tone="error">متن مرتبط دریافت نشده است.</Notice> : <><div lang="en" dir="ltr">{passage && <blockquote>{passage.text}</blockquote>}<h3>{q.stem}</h3><ol type="A">{q.options.map(o => <li key={o.id}>{o.text} {o.id === q.correctOptionId ? '✓' : ''}{o.id === q.selectedOptionId ? ' ←' : ''}</li>)}</ol><p>{q.explanation}</p></div><p>گزینه صحیح: {q.options.find(o => o.id === q.correctOptionId)?.text} · پاسخ شما: {q.options.find(o => o.id === q.selectedOptionId)?.text ?? 'بدون پاسخ'}</p></>}
    </details>
  })}</>
}
