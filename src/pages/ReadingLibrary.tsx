import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, LockKeyhole, MessageSquare, Search, Sparkles } from 'lucide-react'
import { cent, dateFa } from '../services/cent'
import { LoadState, useRemote } from '../components/CentUI'
import { Badge, EmptyState, Skeleton } from '../components/UI'
import { ReadingHero, ReadingPosition, ResourceCover } from '../components/ReadingUI'
import { useCommerceAccess } from '../services/useCommerceAccess'

export function LibraryPage() {
  const access = useCommerceAccess()
  const remote = { ...access, data: access.library }
  const curriculum = useRemote(cent.curriculum)
  return <div className="reading-library"><ReadingHero title="کتابخانه من" description="از همان‌جایی که مانده بودی، ادامه بده"><Link className="button button-secondary" to="/package">دیدن آموزش‌ها</Link></ReadingHero>
    {remote.busy ? <Skeleton label="در حال دریافت منابع کتابخانه…" lines={4}/> : <LoadState {...remote} retry={remote.reload}/>}
    {remote.data && !remote.busy && !remote.error && <><section className="reading-access"><Sparkles aria-hidden="true"/><div><b>دسترسی هر منبع، کنار خودش مشخصه</b><p>خرید جدید هر درس ۱۲ ماه اعتبار داره. یادداشت‌ها و سوابق یادگیری بعد از پایان دسترسی هم باقی می‌مونن.</p></div><Link to="/student/profile">تاریخ دسترسی و تمدید درس‌ها</Link></section>
      {remote.data.trainings.length === 0 ? <EmptyState title="کتابخانه‌ات از اولین آموزش شروع می‌شه" description="آموزشی که انتخاب کنی، با منابع و محل مطالعه‌ات اینجا در دسترس می‌مونه." action={<Link className="button button-primary" to="/package">انتخاب آموزش</Link>}/> : <><p className="reading-caption">نوار مطالعه، بیشترین صفحه بازشده رو نشون می‌ده؛ میزان تسلط از ارزیابی‌ها مشخص می‌شه.</p><div className="reading-collections">{remote.data.trainings.map(training => {
        const docs = remote.data!.documents.filter(d => d.trainingId === training.id)
        const readable = remote.data!.readableTrainingIds.includes(training.id)
        const permanent = remote.data!.entitlements.some(e => e.kind === 'TRAINING' && e.trainingId === training.id && !e.revokedAt)
        const subject = curriculum.data?.courses.find(course => course.trainingId === training.id)?.title
        return <section className="reading-collection" key={training.id}><header><div>{subject && <span className="reading-caption">{subject}</span>}<h2 dir="auto">{training.title}</h2><p dir="auto">{training.description}</p></div><Badge tone={readable ? 'learning' : 'warning'}>{permanent ? 'خرید قبلی' : readable ? 'دسترسی فعال' : 'نیازمند تمدید'}</Badge></header><div className="reading-resource-grid">{docs.map(doc => {
          const documentReadable = remote.data!.readableDocumentIds ? remote.data!.readableDocumentIds.includes(doc.id) : readable
          const progress = remote.data!.progress.find(p => p.documentId === doc.id)
          const count = remote.data!.notes.find(n => n.documentId === doc.id)?.count || 0
          return <article className="reading-resource card" key={doc.id}><ResourceCover title={doc.title} subject={subject}/><div className="reading-resource-body"><h3 dir="auto">{doc.title}</h3><div className="reading-resource-meta"><span><BookOpen size={16} aria-hidden="true"/>{doc.pageCount} صفحه</span><span><MessageSquare size={16} aria-hidden="true"/>{count} یادداشت</span></div><ReadingPosition progress={progress} pageCount={doc.pageCount}/>{documentReadable ? <Link className="button button-primary" to={`/student/study/${doc.id}`}>{progress ? 'ادامه مطالعه' : 'شروع مطالعه'}<span className="sr-only">: {doc.title}</span></Link> : <span className="reading-locked"><LockKeyhole size={18} aria-hidden="true"/>{readable ? 'این منبع در انتظار بازبینی نهایی است' : 'برای مطالعه، دسترسی رو فعال کن'}</span>}</div></article>
        })}</div>{docs.length === 0 && <p className="reading-caption">منابع این آموزش هنوز منتشر نشده‌اند.</p>}{!readable && <Link className="button button-secondary" to="/package">فعال‌سازی دسترسی</Link>}</section>
      })}</div></>}
    </>}
  </div>
}

export function NotesPage() {
  const remote = useRemote(cent.notes)
  const curriculum = useRemote(cent.curriculum)
  const [search, setSearch] = useState('')
  // Preserve the existing case-sensitive body/title search and server ordering.
  const notes = remote.data?.filter(n => `${n.body} ${n.documentTitle}`.includes(search)) || []
  return <div className="reading-notes"><ReadingHero notes title="یادداشت‌های من" description="نکته‌هایی که کنار صفحه‌ها نوشتی، برای مرور اینجان. حتی بعد از پایان اشتراک."/>
    <div className="reading-notes-tools"><label><Search size={19} aria-hidden="true"/><span className="sr-only">جست‌وجو در یادداشت‌ها</span><input type="search" aria-label="جست‌وجو در یادداشت‌ها" placeholder="در متن یا نام منبع جست‌وجو کن…" value={search} onChange={e => setSearch(e.target.value)}/></label>{remote.data && !remote.busy && !remote.error && <span role="status">{notes.length} یادداشت</span>}</div>
    {remote.busy ? <Skeleton label="در حال دریافت یادداشت‌ها…" lines={4}/> : <LoadState {...remote} retry={remote.reload}/>}
    {!remote.busy && !remote.error && (notes.length === 0 ? <EmptyState kind={search ? 'search' : 'empty'} title={search ? 'یادداشتی با این عبارت پیدا نشد' : 'نکته‌هات رو کنار صفحه بنویس'} description={search ? 'عبارت جست‌وجو رو تغییر بده یا پاکش کن.' : 'در فضای مطالعه، روی بخش موردنظرت بزن و یادداشتت رو ثبت کن. از همین‌جا می‌تونی دوباره به صفحه‌اش برگردی.'} action={search ? <button className="button button-secondary" onClick={() => setSearch('')}>پاک کردن جست‌وجو</button> : <Link className="button button-primary" to="/student/content">رفتن به کتابخانه</Link>}/> : <div className="reading-note-list">{notes.map(note => {
      const resource = curriculum.data?.documents.find(document => document.id === note.documentId)
      const subject = resource && curriculum.data?.courses.find(course => course.trainingId === resource.trainingId)?.title
      return <article className="reading-saved-note" key={note.id}><header><div><span dir="auto">{note.documentTitle}</span>{subject && <small dir="auto">{subject}</small>}</div><Badge>صفحه {note.page}</Badge></header><p dir="auto">{note.body}</p><footer><time dateTime={note.updatedAt}>{dateFa(note.updatedAt)}</time><Link className="button button-secondary" to={`/student/study/${note.documentId}?page=${note.page}&note=${note.id}`}>باز کردن صفحه و یادداشت</Link></footer></article>
    })}</div>)}
  </div>
}
