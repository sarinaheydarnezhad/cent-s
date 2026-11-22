import { assessmentPath } from '../services/learning-presentation'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { cent } from '../services/cent'
import { useRemote, LoadState } from '../components/CentUI'
import { EmptyState } from '../components/UI'
import { useCommerceAccess } from '../services/useCommerceAccess'
import { ownsTraining, numberFa } from '../services/commerce'
import { AccessLabel, CommerceLoading, OnlineAccessNotice } from '../components/CommerceUI'
import { ResourceCover } from '../components/ReadingUI'
import { Badge, Notice } from '../components/UI'
import { subjectsApi, toman } from '../services/subjects'

export function CourseCatalog({ actionVariant = 'primary', compact = false, excludeTrainingIds = [] }: { actionVariant?: 'primary' | 'secondary'; compact?: boolean; excludeTrainingIds?: string[] }) {
  const remote = useRemote(cent.curriculum)
  return <><LoadState {...remote} retry={remote.reload}/>
    {remote.data?.courses.length === 0 && <EmptyState title="هنوز درسی منتشر نشده" description="پس از ورود منابع آموزشی، درس‌ها و فصل‌ها اینجا نمایش داده می‌شوند."/>}
    <div className="cent-product-grid">{remote.data?.courses.filter(course => !excludeTrainingIds.includes(course.trainingId)).map(course => {
      const chapters = remote.data!.chapters.filter(ch => ch.courseCode === course.code)
      const topics = remote.data!.topics.filter(t => t.courseCode === course.code)
      const documents = remote.data!.documents.filter(d => d.trainingId === course.trainingId)
      return <article className="card cent-product" data-course={course.code} key={course.code}>
        <div className="cent-product-body"><BookOpen/><h3>{course.title}</h3><p>{documents.length} درس‌نامه · {chapters.length} فصل · {topics.length} مبحث</p><p>{topics.reduce((sum, t) => sum + t.questionCount, 0)} سؤال با پاسخ تشریحی</p>
          {!compact && <p>{chapters.slice(0, 3).map(ch => ch.title).join(' · ')}</p>}
          <Link className={`button button-${actionVariant}`} to={`/courses/${course.code}`}>مشاهده فصل‌ها و درس‌ها</Link>
        </div>
      </article>
    })}</div></>
}

export function CourseDetails() {
  const { code } = useParams()
  const remote = useRemote(cent.curriculum)
  const catalog = useRemote(cent.catalog)
  const subjects = useRemote(subjectsApi.catalog)
  const access = useCommerceAccess()
  const course = remote.data?.courses.find(c => c.code === code)
  const training = catalog.data?.trainings.find(t => t.id === course?.trainingId)
  const library = access.busy || access.error ? null : access.library
  const readable = !!course && !!library?.readableTrainingIds.includes(course.trainingId)
  const owned = ownsTraining(library, course?.trainingId)
  const subjectOffer = subjects.data?.subjects.find(s => s.subjectId === code)
  const documents = remote.data?.documents.filter(d => d.trainingId === course?.trainingId) || []
  const chapters = remote.data?.chapters.filter(c => c.courseCode === course?.code) || []
  return <div className="container commerce-page commerce-detail"><Link className="back-link" to="/package">بازگشت به منابع</Link>
    <CommerceLoading {...remote} retry={remote.reload}/>
    {!remote.busy && !remote.error && !course && <EmptyState title="این درس پیدا نشد" description="از فهرست درس‌های منتشرشده انتخاب کن." action={<Link className="button button-secondary" to="/package">دیدن منابع</Link>}/>}
    {course && !remote.busy && !remote.error && <><section className="commerce-detail-hero"><ResourceCover title={training?.title || course.title} subject={course.title}/><div><span className="eyebrow">منبع آموزشی</span><h1>{training?.title || course.title}</h1><div className="commerce-tags"><Badge>{course.title}</Badge><AccessLabel library={library} trainingId={course.trainingId}/>{training?.includedInSubscription && <Badge tone="learning">داخل اشتراک</Badge>}</div>{training?.description && <p>{training.description}</p>}<div className="commerce-actions"><Link className="button button-secondary" to={assessmentPath(remote.data, course.code)}>تعیین سطح این درس</Link><Link className="button button-secondary" to={'/student/practice?course=' + course.code}>تمرین این درس</Link></div></div></section>
    <div className="commerce-detail-grid"><div><section className="card commerce-content"><h2>درس‌نامه‌های منبع</h2>{documents.length === 0 && <p>هنوز درس‌نامه‌ای برای این درس منتشر نشده.</p>}{documents.map(d => <div className="commerce-lesson" key={d.id}><div><h3>{d.title}</h3><p>{numberFa(d.pageCount)} صفحه یا بخش مطالعه</p></div>{readable && <Link className="button button-secondary" to={'/student/study/' + d.id}>شروع مطالعه</Link>}</div>)}</section>
    <section className="card commerce-content"><h2>فصل‌ها و مهارت‌ها</h2>{chapters.map(ch => <details className="commerce-chapter" key={ch.id}><summary>{ch.title}</summary>{remote.data!.topics.filter(t => t.chapterId === ch.id).map(t => <div className="commerce-lesson" key={t.id}><div><h3>{t.title}</h3><p>{numberFa(t.questionCount)} سؤال</p></div><Link className="text-link" to={assessmentPath(remote.data, course.code, t.id)}>سنجش این مبحث</Link></div>)}</details>)}</section></div>
    <aside className="card commerce-summary"><h2>دسترسی به مطالعه</h2><CommerceLoading {...catalog} retry={catalog.reload}/>{access.user && <CommerceLoading {...access} retry={access.reload}/>}
    {readable && <Notice tone="info" title={owned ? 'این منبع رو قبلاً خریده‌ای' : 'با دسترسی فعلی می‌تونی مطالعه کنی'}>{!owned && library?.hasSubscription && training?.includedInSubscription ? 'دسترسی اشتراکی در مدت اعتبار اشتراک برقرار است؛ مالکیت دائمی نیست.' : 'مجوز مطالعه فعلی از کتابخانه دریافت شده.'}<Link className="button button-primary" to="/student/content">رفتن به کتابخانه<ArrowLeft size={18}/></Link></Notice>}
    {owned && !readable && <Notice>خرید تکی این آموزش ثبت شده، اما مطالعه آن الان در دسترس نیست.<Link to="/student/content">بررسی کتابخانه</Link></Notice>}
    <CommerceLoading {...subjects} retry={subjects.reload}/>
    {subjectOffer && <div className="commerce-purchase-choice"><h3>دسترسی ۱۲ماههٔ {subjectOffer.title}</h3><strong>{toman(subjectOffer.priceRial)}</strong><p>خرید یک‌باره؛ تمدید فقط با انتخاب خودت. تخفیف خرید چند درس در پیش‌فاکتور محاسبه می‌شه.</p><Link className="button button-primary" to={'/package?subjects=' + code}>{subjectOffer.available ? 'انتخاب درس و دریافت قیمت' : 'بررسی آمادگی منابع'}</Link></div>}
    <OnlineAccessNotice/></aside></div></>}
  </div>
}
