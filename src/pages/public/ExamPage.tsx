import { BookOpen, ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card, PageHeader } from '../../components/UI'
import { CourseCatalog } from '../CourseCatalog'

export function ExamPage() {
  return <div className="container public-content-page">
    <PageHeader eyebrow="مسیر آمادگی ایتاتست" title="برای CEnT-S، قدم‌به‌قدم آماده شو." description="از میان درس‌های منتشرشده انتخاب کن، فصل‌ها و مباحث رو ببین و آمادگی‌ات رو در همون موضوع ارزیابی کن."/>
    <div className="public-exam-intro"><Card variant="learning"><BookOpen aria-hidden="true"/><h2>مطالعه و تمرین، با یک مسیر مشخص</h2><p>درس‌نامه‌های هر درس، سؤال‌های موضوعی و پاسخ‌های تشریحی در کنار هم هستن تا مباحث نیازمند مرور رو راحت‌تر پیدا کنی.</p><Badge tone="learning">مسیر فعلی: <bdi lang="en">CEnT-S</bdi></Badge></Card><div><ClipboardCheck aria-hidden="true"/><h2>از کجا شروع کنم؟</h2><p>اگر نمی‌دونی کدوم مبحث به مرور نیاز داره، اول ارزیابی سطح رو امتحان کن. برای ذخیره نتیجه، باید وارد حسابت بشی.</p><Link className="button button-primary" to="/diagnostic/intro">شروع ارزیابی سطح</Link></div></div>
    <section className="public-resources" aria-labelledby="exam-courses"><div className="public-section-heading"><h2 id="exam-courses">درس‌ها و مباحث منتشرشده</h2><p>اطلاعات زیر از منابع آموزشی موجود در ایتاتست میاد. جزئیات مطالعه و دسترسی رو در صفحه هر درس ببین.</p></div><CourseCatalog actionVariant="secondary"/></section>
    <p className="public-factual-note">ایتاتست همراه آمادگی توئه، نه برگزارکننده آزمون. شرایط ثبت‌نام، زمان‌بندی و ضوابط رسمی رو از منبع برگزارکننده بررسی کن. مسیرهای <bdi lang="en">IMAT</bdi> و <bdi lang="en">SAT</bdi> هنوز در دسترس نیستن.</p>
  </div>
}
