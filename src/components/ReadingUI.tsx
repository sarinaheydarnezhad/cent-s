import { useId, type ReactNode } from 'react'
import { BookOpen, NotebookPen } from 'lucide-react'
import type { StudyProgress } from '../services/cent'

export function ReadingHero({ title, description, notes = false, children }: { title: string; description: string; notes?: boolean; children?: ReactNode }) {
  return <header className={`reading-hero${notes ? ' reading-hero-notes' : ''}`}><div><span className="eyebrow">فضای یادگیری تو</span><h1>{title}</h1><p>{description}</p>{children}</div><span className="reading-hero-art" aria-hidden="true">{notes ? <NotebookPen/> : <BookOpen/>}</span></header>
}

// The contract has no cover image. This is a decorative title-based fallback,
// never a preview fetched from a protected document page.
export function ResourceCover({ title, subject }: { title: string; subject?: string }) {
  return <div className="reading-cover" aria-hidden="true"><span className="reading-cover-imprint">ITATEST</span><strong dir="auto">{title}</strong>{subject && <span dir="auto">{subject}</span>}<span className="reading-cover-curve"/></div>
}

export function ReadingPosition({ progress, pageCount }: { progress?: StudyProgress | null; pageCount: number }) {
  const id = useId()
  if (!progress) return <p className="reading-unstarted">هنوز شروع نکردی</p>
  return <div className="reading-position"><p>آخرین محل مطالعه: <b>صفحه {progress.lastPage}</b></p>{pageCount > 0 && <><label htmlFor={id}>بیشترین صفحه بازشده <b>{progress.furthestPage} از {pageCount}</b></label><meter id={id} min={0} max={pageCount} value={progress.furthestPage} aria-valuetext={`تا صفحه ${progress.furthestPage} از ${pageCount} صفحه باز شده؛ این مقدار نشان‌دهنده تسلط نیست`}/></>}</div>
}

export function NoteSaveFeedback({ value }: { value: string }) {
  const success = value === 'در حساب شما ذخیره شد' || value === 'یادداشت حذف شد'
  const pending = value === 'در حال ذخیره…' || value === 'پیش‌نویس روی این دستگاه'
  const error = !!value && !success && !pending
  return <small role={error ? 'alert' : 'status'} className={`cent-save-status${error ? ' reading-save-error' : success ? ' reading-save-success' : ''}`}>{value || 'یادداشت‌ها فقط برای خودت قابل مشاهده‌اند.'}</small>
}
