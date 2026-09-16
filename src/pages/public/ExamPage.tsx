import { AlertTriangle, ArrowLeft, BookOpen, Calculator, Lightbulb, MonitorCog } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/UI'

export function ExamPage() {
  return <div className="container narrow-page">
    <PageHeader eyebrow="راهنمای شروع" title="آشنایی با مسیر آمادگی CEnT-S" description="این صفحه معرفی محصول است و جایگزین اطلاعات رسمی برگزارکننده یا دانشگاه نیست." />
    <div className="notice"><AlertTriangle/><div><b>نسخه تمرینی و غیررسمی</b><p>جزئیات ساختار، زمان‌بندی و قوانین آزمون باید پیش از انتشار تجاری از منابع رسمی روز بررسی و نسخه‌گذاری شود.</p></div></div>
    <div className="info-grid">
      <article className="card"><Calculator/><h3>ریاضیات</h3><p>در MVP روی پایه‌های جبر، درصد و تناسب، احتمال، هندسه و توابع نمونه‌سازی شده است.</p></article>
      <article className="card"><Lightbulb/><h3>منطق</h3><p>سؤال‌های نمونه شامل دنباله، استدلال شرطی، مجموعه‌ها، گزاره و استنتاج‌اند.</p></article>
      <article className="card"><MonitorCog/><h3>مسیرهای هدف</h3><p>محصول برای تمرین متقاضیان رشته‌های کامپیوتری و مدیریت کسب‌وکار طراحی شده؛ پوشش دقیق نیازمند اعتبارسنجی رسمی است.</p></article>
    </div>
    <section className="content-card"><BookOpen/><div><h2>Cent-s چه کاری انجام می‌دهد؟</h2><p>ابتدا با یک ارزیابی کوتاه شواهد اولیه می‌سازد، سپس نتیجه را در سطح درس و مبحث تحلیل می‌کند و یک قدم بعدی پیشنهاد می‌دهد. پکیج اصلی این چرخه را با درس‌نامه، تمرین و شبیه‌ساز ادامه می‌دهد.</p><Link className="button button-primary" to="/diagnostic/intro">شروع ارزیابی <ArrowLeft/></Link></div></section>
  </div>
}
