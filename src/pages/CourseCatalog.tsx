import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { cent, toman } from '../services/cent'
import { useRemote, LoadState } from '../components/CentUI'
import { EmptyState, PageHeader } from '../components/UI'
import { useAppState } from '../state/AppState'

export function CourseCatalog() {
  const remote = useRemote(cent.curriculum)
  return <><LoadState {...remote} retry={remote.reload}/>
    {remote.data?.courses.length === 0 && <EmptyState title="هنوز درسی منتشر نشده" description="پس از ورود منابع آموزشی، درس‌ها و فصل‌ها اینجا نمایش داده می‌شوند."/>}
    <div className="cent-product-grid">{remote.data?.courses.map(course => {
      const chapters = remote.data!.chapters.filter(ch => ch.courseCode === course.code)
      const topics = remote.data!.topics.filter(t => t.courseCode === course.code)
      const documents = remote.data!.documents.filter(d => d.trainingId === course.trainingId)
      return <article className="card cent-product" data-course={course.code} key={course.code}>
        <div className="cent-product-body"><BookOpen/><h3>{course.title}</h3><p>{documents.length} درس‌نامه · {chapters.length} فصل · {topics.length} مبحث</p><p>{topics.reduce((sum, t) => sum + t.questionCount, 0)} سؤال با پاسخ تشریحی</p>
          <p>{chapters.slice(0, 3).map(ch => ch.title).join(' · ')}</p>
          <Link className="button button-primary" to={`/courses/${course.code}`}>مشاهده فصل‌ها و درس‌ها <ArrowLeft size={16}/></Link>
        </div>
      </article>
    })}</div></>
}

export function CourseDetails() {
  const { code } = useParams()
  const remote = useRemote(cent.curriculum)
  const catalog = useRemote(cent.catalog)
  const { library } = useAppState()
  const course = remote.data?.courses.find(c => c.code === code)
  const readable = !!course && !!library?.readableTrainingIds.includes(course.trainingId)
  const products = catalog.data?.products.filter(p => p.kind === 'TRAINING' && p.trainingId === course?.trainingId) || []
  return <div className="container narrow-page"><Link className="back-link" to="/package">بازگشت به درس‌ها</Link>
    <LoadState {...remote} retry={remote.reload}/>
    {!remote.busy && !remote.error && !course && <EmptyState title="این درس پیدا نشد" description="از فهرست درس‌های منتشرشده انتخاب کنید."/>}
    {course && <><PageHeader title={course.title} description="فصل‌ها، مباحث و درس‌نامه‌های منابع آموزشی این درس"/>
      <div className="cent-tag-row"><Link className="button button-secondary" to={`/diagnostic/test?course=${course.code}`}>تعیین سطح این درس</Link><Link className="button button-secondary" to={`/student/practice?course=${course.code}`}>تمرین این درس</Link></div>
      {!readable && <section className="card cent-admin-panel"><h2>دسترسی به مطالعه</h2><LoadState {...catalog} retry={catalog.reload}/>{products.map(p => <p key={p.id}><Link className="button button-primary" to={`/checkout?product=${p.id}`}>خرید دسترسی · {toman(p.priceRial)}</Link></p>)}{products.length === 0 && !catalog.busy && !catalog.error && <p>برای این درس هنوز قیمت خرید تکی تعیین نشده است. اگر اشتراک فعال داری، از کتابخانه وارد درس شو.</p>}</section>}
      <section className="card cent-admin-panel"><h2>درس‌نامه‌های منبع</h2>{remote.data!.documents.filter(d => d.trainingId === course.trainingId).map(d => <div className="chapter-progress" key={d.id}><h3>{d.title}</h3><p>{d.pageCount} بخش مطالعه</p>{readable && <Link className="button button-secondary" to={`/student/study/${d.id}`}>شروع مطالعه</Link>}</div>)}</section>
      <section className="card cent-admin-panel"><h2>فصل‌ها و مهارت‌ها</h2>{remote.data!.chapters.filter(ch => ch.courseCode === course.code).map(ch => <details className="cent-answer-review" key={ch.id}><summary>{ch.title}</summary>{remote.data!.topics.filter(t => t.chapterId === ch.id).map(t => <div className="chapter-progress" key={t.id}><h3>{t.title}</h3><p>{t.questionCount} سؤال</p><Link className="text-link" to={`/diagnostic/test?course=${course.code}&topic=${t.id}`}>سنجش این مبحث</Link></div>)}</details>)}</section>
    </>}
  </div>
}
