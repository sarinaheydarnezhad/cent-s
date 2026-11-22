import { assessmentPath } from '../services/learning-presentation'
import { Link } from 'react-router-dom'
import { cent } from '../services/cent'
import { LoadState, useRemote } from '../components/CentUI'
import { AssessmentHero, AssessmentSkeleton, SubjectIcon } from '../components/AssessmentUI'
import { Badge, EmptyState, ProgressBar } from '../components/UI'

export function ReadinessPage() {
  const catalog = useRemote(cent.curriculum)
  const mastery = useRemote(cent.mastery)
  return <div className="assessment-page readiness-page"><AssessmentHero title="آمادگی من" description="درس و مبحثت رو پیدا کن؛ از مطالعه شروع کن یا با یک ارزیابی، وضعیتت رو بشناس."><Link className="button button-secondary" to="/diagnostic/test">شروع ارزیابی سطح</Link></AssessmentHero>
    {catalog.busy ? <AssessmentSkeleton label="در حال دریافت درس‌ها و مباحث…"/> : <LoadState {...catalog} retry={catalog.reload}/>}
    <LoadState {...mastery} busy={false} retry={mastery.reload}/>
    {catalog.data && !catalog.busy && !catalog.error && <><div className="assessment-section-title"><h2>از کدوم درس شروع می‌کنی؟</h2><Link className="text-link" to="/student/content">کتابخانه من</Link></div>
      {catalog.data.courses.length === 0 && <EmptyState title="هنوز درسی منتشر نشده" description="درس‌ها و مباحث منتشرشده اینجا نمایش داده می‌شن."/>}
      <div className="readiness-courses">{catalog.data.courses.map(course => {
        const status = !mastery.error && !mastery.busy ? mastery.data?.courses.find(c => c.code === course.code) : undefined
        return <section className="card assessment-course" key={course.code} data-readiness-course={course.code}><div className="assessment-course-heading"><SubjectIcon code={course.code}/><div><h2>{course.title}</h2><Badge tone={status?.assessedTopics ? 'learning' : 'neutral'}>{status ? status.assessedTopics ? `${status.assessedTopics} از ${status.totalTopics} مبحث سنجیده شده` : 'هنوز سنجیده نشده' : mastery.busy ? 'در حال دریافت وضعیت…' : 'وضعیت سنجش در دسترس نیست'}</Badge></div></div>
          {status && <div className={status.assessedTopics ? '' : 'assessment-unassessed'}><div className="assessment-value-label"><span>پیشرفت در برنامه درسی</span><b>{status.assessedTopics ? `${status.confirmedProgressPercentage}٪` : 'سنجیده نشده'}</b></div><ProgressBar label={`پیشرفت ${course.title}`} value={status.confirmedProgressPercentage} valueText={!status.assessedTopics ? 'هنوز سنجیده نشده' : undefined}/></div>}
          <div className="assessment-actions"><Link className="button button-primary" to={assessmentPath(catalog.data, course.code)}>سنجش این درس</Link><Link className="button button-ghost" to={`/courses/${course.code}`}>فصل‌ها و مطالعه</Link></div>
          {catalog.data!.chapters.filter(ch => ch.courseCode === course.code).map(ch => <details className="assessment-chapter" key={ch.id}><summary>{ch.title}</summary>{catalog.data!.topics.filter(t => t.chapterId === ch.id).map(topic => {
            const measured = status?.topics.find(t => t.id === topic.id)
            return <div className="readiness-topic" key={topic.id}><div><h3>{topic.title}</h3><p>{topic.questionCount} سؤال در بانک · {measured ? measured.masteryPercentage == null ? measured.evidenceQuestions ? 'شواهد ناکافی برای تسلط' : 'سنجیده نشده' : `تسلط برآوردشده ${measured.masteryPercentage}٪` : 'وضعیت سنجش در دسترس نیست'}</p></div><Link className="button button-secondary button-small" to={assessmentPath(catalog.data, course.code, topic.id)}>سنجش مبحث</Link><Link className="text-link" to={`/student/practice?course=${course.code}&topic=${topic.id}`}>تمرین</Link></div>
          })}</details>)}
        </section>
      })}</div><p className="assessment-muted">پیشرفت از پاسخ‌های ثبت‌شده برآورد می‌شه. باز کردن یا خواندن درس‌نامه، به‌تنهایی درصد تسلط رو تغییر نمی‌ده.</p></>}
  </div>
}
