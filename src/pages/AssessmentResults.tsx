import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock3, ClipboardCheck, CircleMinus } from 'lucide-react'
import { cent, dateFa, type ExamOutcome } from '../services/cent'
import { useAppState } from '../state/AppState'
import { LoadState, useRemote } from '../components/CentUI'
import { Badge, Card, ProgressBar } from '../components/UI'
import { AssessmentGuidance, AssessmentHero, AssessmentSkeleton, ResultRing, SubjectIcon, TopicLabel } from '../components/AssessmentUI'
import { studyReturnPath } from '../services/study-return'
import { PracticeReview } from '../components/PracticeReview'

export function CentResultPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const returnToStudy = studyReturnPath(params.get('returnTo'))
  const fetcher = useCallback<() => Promise<ExamOutcome>>(() => cent.outcome(id), [id])
  const remote = useRemote(fetcher)
  const curriculum = useRemote(cent.curriculum)
  const outcome = remote.data
  return <div className="assessment-page result-detail"><AssessmentHero title="گزارش آزمون" description="نتیجه پاسخ‌هات در این آزمون؛ برای مرور و انتخاب قدم بعدی."><Link className="button button-secondary" to="/student/results">همه نتایج</Link></AssessmentHero>
    {remote.busy ? <AssessmentSkeleton label="در حال دریافت گزارش آزمون…"/> : <LoadState {...remote} retry={remote.reload}/>}
    <LoadState {...curriculum} busy={false} retry={curriculum.reload}/>
    {outcome && !remote.busy && !remote.error && <><Card className="assessment-result-summary"><ResultRing value={outcome.result.percentage}/><div><h2>درصد پاسخ‌های صحیح</h2><p>{outcome.result.correct} پاسخ صحیح از {outcome.result.total} سؤال</p><p className="assessment-muted">{dateFa(outcome.result.createdAt)} · این درصد، نتیجه همین آزمونه؛ درصد تسلط یا مطالعه نیست.</p><dl className="assessment-metrics"><div><dt><CheckCircle2 aria-hidden="true"/> صحیح</dt><dd>{outcome.result.correct}</dd></div><div><dt><CircleMinus aria-hidden="true"/> نادرست</dt><dd>{outcome.result.incorrect}</dd></div><div><dt><Clock3 aria-hidden="true"/> بدون پاسخ</dt><dd>{outcome.result.unanswered}</dd></div></dl></div></Card>
      <AssessmentGuidance analysis={outcome.analysis} curriculum={curriculum.data} href={returnToStudy || '/student/content'} action={returnToStudy ? 'بازگشت به مطالعه' : 'رفتن به مطالعه'}/>
      <div className="assessment-detail-grid"><section className="card assessment-panel"><h2>عملکرد درس‌ها و مباحث</h2><Link className="text-link" to="/student/analysis">نقشه یادگیری و تسلط همه مباحث</Link>
        {Object.entries(outcome.result.bySubject).filter(([,r]) => r.total > 0).map(([code, r]) => <div className="assessment-breakdown" key={code}><div className="assessment-value-label"><span className="assessment-subject-title"><SubjectIcon code={code}/>{curriculum.data?.courses.find(c => c.code === code)?.title || 'درس آزمون'}</span><strong>{r.percentage}٪</strong></div><p>{r.correct} پاسخ صحیح از {r.total} سؤال</p><ProgressBar tone="action" label={curriculum.data?.courses.find(c => c.code === code)?.title || 'درس آزمون'} value={r.percentage}/></div>)}
        {Object.entries(outcome.result.byTopic).map(([topic, result]) => <div className="assessment-breakdown" key={topic}><div className="assessment-value-label"><b><TopicLabel value={topic} curriculum={curriculum.data}/></b><strong>{result.percentage}٪</strong></div><p>{result.correct} پاسخ صحیح از {result.total} سؤال</p><ProgressBar tone="action" label="درصد پاسخ صحیح در مبحث" value={result.percentage}/></div>)}
      </section><section className="card assessment-panel"><h2>مرور پاسخ‌ها</h2><p className="assessment-muted">هر سؤال رو باز کن تا پاسخ صحیح و توضیحش رو ببینی.</p><PracticeReview outcome={outcome}/></section></div>
    </>}
  </div>
}

export function CentSimulatorsPage() {
  const { hasPackage } = useAppState()
  const mockLink = <section className="card assessment-panel"><h2>آزمون جامع با قالب رسمی</h2><p>شش بخش، ۶۵ سؤال و ۱۴۰ دقیقه با زمان مستقل هر بخش.</p><Link className="button button-primary" to="/student/mock-exams">آزمون جامع و ادامه تلاش‌های قبلی</Link></section>
  return <div className="assessment-page simulator-page"><AssessmentHero title="آزمون‌های شبیه‌ساز" description="بعد از مطالعه، با سؤال‌های ترکیبی درس‌ها خودت رو دوباره بسنج."/>{mockLink}<section className="card assessment-simulator"><span className="assessment-simulator-art" aria-hidden="true"><ClipboardCheck/></span><div><Badge tone={hasPackage ? 'learning' : 'neutral'}>{hasPackage ? 'اشتراک فعال' : 'نیازمند اشتراک فعال'}</Badge><h2>مرور ترکیبی درس‌ها — قالب قبلی</h2><p>آزمون از سؤال‌های منتشرشده آماده می‌شه. نتیجه و گزارش موضوعی، بعد از ثبت پاسخ‌ها در حسابت باقی می‌مونه.</p><ul><li>حداکثر ۶۰ دقیقه برای هر تلاش</li><li>انتخاب درس و مبحث در مرحله بعد</li><li>تعداد سؤال‌ها پس از آماده شدن آزمون مشخص می‌شه</li></ul><Link className="button button-primary" to={hasPackage ? '/student/simulators/test' : '/package'}>{hasPackage ? 'شروع شبیه‌ساز' : 'انتخاب اشتراک مطالعه'}</Link></div></section></div>
}
