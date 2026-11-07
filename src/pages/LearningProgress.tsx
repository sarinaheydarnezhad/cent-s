import { Link } from 'react-router-dom'
import { cent } from '../services/cent'
import { LoadState, useRemote } from '../components/CentUI'
import { PageHeader, ProgressBar } from '../components/UI'

export function LearningProgress() {
  const report = useRemote(cent.mastery)
  const curriculum = useRemote(cent.curriculum)
  return <><PageHeader title="نقشه یادگیری من" description="پیشرفت در برنامه درسیِ منابع شما، به تفکیک درس و مهارت"/>
    <p className="notice">این درصدها از پاسخ‌های ثبت‌شده شما در تمرین و آزمون برآورد می‌شوند. برای هر مبحث حداقل ۳ سؤال متفاوت لازم است؛ آخرین پاسخ به حداکثر ۱۰ سؤال متفاوت محاسبه می‌شود. مباحث سنجیده‌نشده در پیشرفت کل سهم صفر دارند. خواندن درس به‌تنهایی درصد تسلط را تغییر نمی‌دهد.</p>
    <LoadState {...report} retry={report.reload}/>
    {report.data?.courses.map(course => <section className="card cent-admin-panel" key={course.code}>
      <h2>{course.title} · پیشرفت تأییدشده {course.confirmedProgressPercentage}٪</h2>
      <ProgressBar value={course.confirmedProgressPercentage}/>
      <p>{course.assessedTopics} از {course.totalTopics} مبحث سنجیده شده ({course.coveragePercentage}٪ پوشش). میانگین دقت مباحث سنجیده‌شده: {course.assessedAccuracyPercentage == null ? 'هنوز سنجیده نشده' : `${course.assessedAccuracyPercentage}٪`}</p>
      <Link className="button button-secondary" to={`/diagnostic/test?course=${course.code}`}>سنجش این درس</Link>
      {curriculum.data?.chapters.filter(ch => ch.courseCode === course.code).map(chapter => <details className="cent-answer-review" key={chapter.id}>
        <summary>{chapter.title}</summary>
        {course.topics.filter(t => t.chapterId === chapter.id).map(topic => <article className="cent-mastery-topic" key={topic.id}>
          <div className="cent-mastery-topic-header"><b>{topic.title}</b><strong>{topic.masteryPercentage == null ? topic.evidenceQuestions === 0 ? 'سنجیده نشده' : 'شواهد ناکافی' : `${topic.masteryPercentage}٪`}</strong></div>
          <ProgressBar value={topic.masteryPercentage ?? 0}/>
          <p>{topic.evidenceQuestions} سؤال متفاوت از بانک {topic.availableQuestions} سؤالی · دقت مشاهده‌شده: {topic.accuracyPercentage == null ? '—' : `${topic.accuracyPercentage}٪`}</p>
          <div className="cent-mastery-topic-actions"><Link className="button button-secondary button-small" to={`/diagnostic/test?course=${course.code}&topic=${topic.id}`}>سنجش مهارت</Link><Link className="button button-ghost button-small" to={`/student/practice?course=${course.code}&topic=${topic.id}`}>تمرین و مرور</Link></div>
        </article>)}
      </details>)}
    </section>)}
  </>
}
