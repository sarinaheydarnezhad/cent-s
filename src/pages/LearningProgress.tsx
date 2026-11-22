import { assessmentPath } from '../services/learning-presentation'
import { Link } from 'react-router-dom'
import { cent } from '../services/cent'
import { LoadState, useRemote } from '../components/CentUI'
import { Badge, EmptyState, Notice, ProgressBar } from '../components/UI'
import { AssessmentGuidance, AssessmentHero, AssessmentSkeleton, SubjectIcon, TopicLabel } from '../components/AssessmentUI'

async function latestAnalysis() {
  const attempts = await cent.attempts()
  return attempts[0] ? cent.outcome(attempts[0].id) : null
}

export function LearningProgress() {
  const report = useRemote(cent.mastery)
  const curriculum = useRemote(cent.curriculum)
  const latest = useRemote(latestAnalysis)
  return <div className="assessment-page analysis-page"><AssessmentHero title="تحلیل شخصی" description="پاسخ‌های ثبت‌شده‌ات رو مرور کن و ببین برای ادامه، کدوم مبحث رو انتخاب کنی."><Link className="button button-secondary" to="/student/preparation">رفتن به آمادگی من</Link></AssessmentHero>
    <section aria-label="راهنمای ادامه یادگیری">
      {latest.busy ? <AssessmentSkeleton label="در حال دریافت راهنمایی آخرین نتیجه…"/> : <LoadState {...latest} retry={latest.reload}/>}
      {!latest.busy && !latest.error && (latest.data ? <><AssessmentGuidance analysis={latest.data.analysis} curriculum={curriculum.data}/><div className="analysis-insights">{[{ title: 'نقاط قوت در آخرین نتیجه', items: latest.data.analysis.strengths }, { title: 'مباحث نیازمند مرور در آخرین نتیجه', items: latest.data.analysis.weaknesses }].map(group => <section className="card assessment-panel" key={group.title}><h2>{group.title}</h2>{group.items.length ? <ul>{group.items.map((text, i) => <li key={i}><TopicLabel value={text} curriculum={curriculum.data}/></li>)}</ul> : <p className="assessment-muted">برای این نتیجه، موردی گزارش نشده.</p>}</section>)}</div></> : <EmptyState title="تحلیلت با اولین پاسخ‌ها شکل می‌گیره" description="یک درس یا مبحث رو بسنج؛ بعد از ثبت پاسخ‌ها، نتیجه و راهنمای ادامه رو اینجا می‌بینی." action={<Link className="button button-primary" to="/diagnostic/test">شروع ارزیابی سطح</Link>}/>) }
    </section>
    <div className="assessment-section-title"><h2>نقشه یادگیری من</h2><Link className="text-link" to="/student/results">نتایج من</Link></div>
    <details className="assessment-method"><summary>این درصدها چه معنایی دارن؟</summary><p>این درصدها از پاسخ‌های ثبت‌شده در تمرین و آزمون برآورد می‌شن. برای هر مبحث حداقل ۳ سؤال متفاوت لازمه؛ آخرین پاسخ به حداکثر ۱۰ سؤال متفاوت محاسبه می‌شه. مباحث سنجیده‌نشده در پیشرفت کل سهم صفر دارن. خواندن درس به‌تنهایی درصد تسلط رو تغییر نمی‌ده. پوشش، سهم مباحث سنجیده‌شده از برنامه درسیه.</p></details>
    {report.busy ? <AssessmentSkeleton label="در حال دریافت وضعیت درس‌ها…"/> : <LoadState {...report} retry={report.reload}/>}
    {curriculum.busy ? <AssessmentSkeleton label="در حال دریافت نام فصل‌ها و مباحث…"/> : <LoadState {...curriculum} retry={curriculum.reload}/>}
    {report.data && !report.error && !report.busy && report.data.courses.length === 0 && <EmptyState title="وضعیت درس‌ها هنوز در دسترس نیست" description="پس از انتشار مباحث، وضعیت سنجش اون‌ها اینجا نمایش داده می‌شه."/>}
    {!report.busy && !report.error && report.data?.courses.map(course => <section className="card assessment-course analysis-course" key={course.code} data-analysis-course={course.code}>
      <div className="assessment-course-heading"><SubjectIcon code={course.code}/><div><h2>{course.title} · {course.assessedTopics ? `پیشرفت تأییدشده ${course.confirmedProgressPercentage}٪` : 'هنوز سنجیده نشده'}</h2><Badge tone={course.assessedTopics ? 'learning' : 'neutral'}>{course.assessedTopics ? `${course.assessedTopics} از ${course.totalTopics} مبحث سنجیده شده` : 'هنوز سنجیده نشده'}</Badge></div></div>
      <div className={course.assessedTopics ? '' : 'assessment-unassessed'}><ProgressBar label={`پیشرفت ${course.title}`} value={course.confirmedProgressPercentage} valueText={!course.assessedTopics ? 'هنوز سنجیده نشده؛ صفر نشان‌دهنده تسلط نیست' : undefined}/></div>
      <dl className="assessment-metrics"><div><dt>پوشش سنجش برنامه درسی</dt><dd>{course.coveragePercentage}٪</dd></div><div><dt>دقت در مباحث سنجیده‌شده</dt><dd>{course.assessedAccuracyPercentage == null ? 'هنوز سنجیده نشده' : `${course.assessedAccuracyPercentage}٪`}</dd></div></dl>
      <Link className="button button-secondary" to={assessmentPath(curriculum.data, course.code)}>سنجش این درس</Link>
      {!curriculum.error && !curriculum.busy && curriculum.data?.chapters.filter(ch => ch.courseCode === course.code).map(chapter => <details className="assessment-chapter" key={chapter.id}>
        <summary>{chapter.title}</summary>
        {course.topics.filter(t => t.chapterId === chapter.id).map(topic => <article className={`cent-mastery-topic${topic.masteryPercentage == null ? ' assessment-unassessed' : ''}`} key={topic.id}>
          <div className="cent-mastery-topic-header"><h3>{topic.title}</h3><Badge tone={topic.masteryPercentage == null ? 'neutral' : 'learning'}>{topic.masteryPercentage == null ? topic.evidenceQuestions === 0 ? 'سنجیده نشده' : 'شواهد ناکافی' : `${topic.masteryPercentage}٪ تسلط برآوردشده`}</Badge></div>
          <ProgressBar label={`تسلط ${topic.title}`} value={topic.masteryPercentage ?? 0} valueText={topic.masteryPercentage == null ? topic.evidenceQuestions === 0 ? 'سنجیده نشده' : 'شواهد ناکافی' : undefined}/>
          <p>{topic.evidenceQuestions} سؤال متفاوت از بانک {topic.availableQuestions} سؤالی · دقت مشاهده‌شده: {topic.accuracyPercentage == null ? '—' : `${topic.accuracyPercentage}٪`}</p>
          <div className="cent-mastery-topic-actions"><Link className="button button-secondary button-small" to={assessmentPath(curriculum.data, course.code, topic.id)}>سنجش مهارت</Link><Link className="button button-ghost button-small" to={`/student/practice?course=${course.code}&topic=${topic.id}`}>تمرین و مرور</Link></div>
        </article>)}
      </details>)}
      {curriculum.error && <Notice>برای دیدن فصل‌ها و مهارت‌ها، فهرست مباحث رو از پیام بالای صفحه دوباره دریافت کن.</Notice>}
    </section>)}
  </div>
}
