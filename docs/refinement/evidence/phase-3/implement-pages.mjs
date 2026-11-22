import fs from 'node:fs'
const write=(file,source)=>fs.writeFileSync(file,source.trimStart())
write('src/pages/public/HomePage.tsx',`
import { BookOpen, ChartNoAxesCombined, ClipboardCheck, Compass, GraduationCap, Layers3, NotebookPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card } from '../../components/UI'
import { CourseCatalog } from '../CourseCatalog'
import { LearningIllustration } from './LearningIllustration'

export function HomePage() {
  return <div className="public-home">
    <section className="public-hero" aria-labelledby="home-title">
      <div className="container public-hero-grid">
        <div className="public-hero-copy">
          <Badge tone="learning">همراه آمادگی تو برای <bdi lang="en">CEnT-S</bdi></Badge>
          <h1 id="home-title">یاد بگیر،<br/><span>با روش خودت.</span></h1>
          <p>از شناخت مباحثی که به مرور نیاز دارن تا مطالعه و تمرین، ایتاتست کمکت می‌کنه قدم بعدی آمادگی‌ات رو روشن‌تر ببینی.</p>
          <div className="public-actions"><Link className="button button-primary button-large" to="/diagnostic/intro">شروع ارزیابی سطح</Link><Link className="button button-secondary button-large" to="/exam">آشنایی با مسیر آمادگی</Link></div>
          <p className="public-hero-note">ارزیابی موضوعی · درس‌نامه و تمرین · پیگیری پیشرفت</p>
        </div>
        <div className="public-hero-art"><LearningIllustration/><div className="public-art-caption"><BookOpen size={20} aria-hidden="true"/><span>مسیر روشن‌تر، یک مبحث در هر قدم.</span></div></div>
      </div>
      <div className="container public-benefits">
        <article><ClipboardCheck aria-hidden="true"/><div><h2>شروع از شناخت خودت</h2><p>عملکردت رو در درس و مبحث انتخابی ببین.</p></div></article>
        <article><Layers3 aria-hidden="true"/><div><h2>مطالعه و تمرین در کنار هم</h2><p>از درس‌نامه به سؤال و پاسخ تشریحی برس.</p></div></article>
        <article><ChartNoAxesCombined aria-hidden="true"/><div><h2>پیشرفت قابل پیگیری</h2><p>نتیجه ارزیابی و مسیر مطالعه‌ات رو مرور کن.</p></div></article>
      </div>
    </section>
    <section className="public-section container" aria-labelledby="exams-title">
      <div className="public-section-heading"><span className="eyebrow">یک شروع مشخص</span><h2 id="exams-title">برای کدوم آزمون آماده می‌شی؟</h2><p>مسیر آمادگی فعلی ایتاتست برای <bdi lang="en">CEnT-S</bdi> در دسترسه.</p></div>
      <div className="public-exam-grid">
        <Card className="public-exam-card public-exam-available"><header><GraduationCap aria-hidden="true"/><Badge tone="info">در دسترس</Badge></header><h3 lang="en" dir="ltr">CEnT-S</h3><p>درس‌ها، مباحث و منابع آمادگی رو ببین و موضوع ارزیابی‌ات رو انتخاب کن.</p><Link className="button button-secondary" to="/exam">دیدن مسیر <bdi lang="en">CEnT-S</bdi></Link></Card>
        <Card className="public-exam-card"><header><GraduationCap aria-hidden="true"/><Badge>در برنامه آینده</Badge></header><h3 lang="en" dir="ltr">IMAT</h3><p>این مسیر هنوز در دسترس نیست. در حال حاضر امکان ثبت‌نام یا شروع آمادگی برای این آزمون وجود نداره.</p></Card>
        <Card className="public-exam-card"><header><GraduationCap aria-hidden="true"/><Badge>در برنامه آینده</Badge></header><h3 lang="en" dir="ltr">SAT</h3><p>این مسیر هنوز در دسترس نیست. در حال حاضر امکان ثبت‌نام یا شروع آمادگی برای این آزمون وجود نداره.</p></Card>
      </div>
    </section>
    <section className="container public-path-section" aria-labelledby="path-title">
      <Card variant="learning" className="public-path"><div className="public-section-heading"><span className="eyebrow">قدم‌های کوچک، مسیر روشن</span><h2 id="path-title">چطور با ایتاتست جلو می‌ری؟</h2><p>لازم نیست همه‌چیز رو یک‌باره شروع کنی. از یک درس یا مبحث شروع کن.</p></div>
        <ol className="public-path-grid">
          <li><ClipboardCheck aria-hidden="true"/><h3>سطحت رو ارزیابی کن</h3><p>درس یا مبحثت رو انتخاب کن و با پاسخ به سؤال‌ها، عملکردت رو بشناس.</p></li>
          <li><NotebookPen aria-hidden="true"/><h3>بخون و تمرین کن</h3><p>درس‌نامه رو بخون، یادداشت بردار و با سؤال‌های هر مبحث تمرین کن.</p></li>
          <li><Compass aria-hidden="true"/><h3>قدم بعدی رو پیدا کن</h3><p>نتیجه‌ها و پیشرفتت رو مرور کن و پیشنهاد مطالعه همون مبحث رو ببین.</p></li>
        </ol>
      </Card>
    </section>
    <section className="public-section container public-resources" aria-labelledby="resources-title"><div className="public-section-heading"><span className="eyebrow">از همین‌جا شروع کن</span><h2 id="resources-title">درس‌ها و منابع آمادگی</h2><p>فصل‌ها و مباحث هر درس رو ببین. جزئیات دسترسی به درس‌نامه‌ها در صفحه هر درس مشخصه.</p></div><CourseCatalog/></section>
    <section className="container public-final-section" aria-labelledby="next-title"><div className="public-final"><div><span className="eyebrow">قدم بعدی تو</span><h2 id="next-title">اول ببین کجا ایستادی.</h2><p>با یک ارزیابی موضوعی شروع کن؛ بعد، مباحث نیازمند مرور رو دقیق‌تر انتخاب کن.</p></div><Link className="button button-primary button-large" to="/diagnostic/intro">شروع ارزیابی سطح</Link></div></section>
  </div>
}
`)
write('src/pages/public/LearningIllustration.tsx',`
// Original code-native artwork: an academic portico and open book, not product data.
export function LearningIllustration() {
  return <svg className="public-learning-illustration" viewBox="0 0 560 430" aria-hidden="true" focusable="false">
    <path className="art-slate-soft" d="M36 302C4 214 79 58 191 68c92 8 95 106 171 98 128-13 159 39 159 109 0 101-113 128-242 120C156 389 65 382 36 302Z"/>
    <circle className="art-sage" cx="394" cy="112" r="70"/>
    <path className="art-learning" d="M48 352c68-18 116-14 161-7 67 10 143-34 215-21 51 9 76 28 101 53H48Z"/>
    <g className="art-building"><path d="m121 156 151-72 151 72v20H121Z"/><path d="M137 183h270v139H137Z"/></g>
    <path className="art-line" d="m121 156 151-72 151 72M150 163h244M137 184h270M128 325h288M115 337h314"/>
    <g className="art-arches"><path d="M160 321v-75a29 29 0 0 1 58 0v75Z"/><path d="M243 321v-75a29 29 0 0 1 58 0v75Z"/><path d="M326 321v-75a29 29 0 0 1 58 0v75Z"/></g>
    <path className="art-line" d="M150 195h244M171 208h36m47 0h36m47 0h36"/>
    <g className="art-book"><path d="M193 329q43-17 79 5v59q-36-21-79-6Z"/><path d="M272 334q36-22 79-5v58q-43-15-79 6Z"/></g>
    <path className="art-line" d="M272 339v48m-63-40q23-5 46 4m-46 10q23-5 46 4m34-14q23-9 46-4m-46 18q23-9 46-4"/>
    <path className="art-plant" d="M92 339v-60m0 34c-25-4-29-22-27-32 21 2 27 14 27 32Zm0-14c22-3 28-19 25-31-19 3-25 15-25 31Zm365 55v-71m0 42c-25-4-31-23-27-35 23 3 27 18 27 35Zm0-17c23-3 28-20 25-32-20 3-25 17-25 32Z"/>
    <path className="art-line" d="M60 355h72m292 14h67"/><path className="art-sage" d="m272 111 16 14-7 8-9-8-9 8-7-8Z"/>
  </svg>
}
`)
write('src/pages/public/ExamPage.tsx',`
import { BookOpen, ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card, PageHeader } from '../../components/UI'
import { CourseCatalog } from '../CourseCatalog'

export function ExamPage() {
  return <div className="container public-content-page">
    <PageHeader eyebrow="مسیر آمادگی ایتاتست" title="برای CEnT-S، قدم‌به‌قدم آماده شو." description="از میان درس‌های منتشرشده انتخاب کن، فصل‌ها و مباحث رو ببین و آمادگی‌ات رو در همون موضوع ارزیابی کن."/>
    <div className="public-exam-intro"><Card variant="learning"><BookOpen aria-hidden="true"/><h2>مطالعه و تمرین، با یک مسیر مشخص</h2><p>درس‌نامه‌های هر درس، سؤال‌های موضوعی و پاسخ‌های تشریحی در کنار هم هستن تا مباحث نیازمند مرور رو راحت‌تر پیدا کنی.</p><Badge tone="learning">مسیر فعلی: <bdi lang="en">CEnT-S</bdi></Badge></Card><div><ClipboardCheck aria-hidden="true"/><h2>از کجا شروع کنم؟</h2><p>اگر نمی‌دونی کدوم مبحث به مرور نیاز داره، اول ارزیابی سطح رو امتحان کن. برای ذخیره نتیجه، باید وارد حسابت بشی.</p><Link className="button button-primary" to="/diagnostic/intro">شروع ارزیابی سطح</Link></div></div>
    <section className="public-resources" aria-labelledby="exam-courses"><div className="public-section-heading"><h2 id="exam-courses">درس‌ها و مباحث منتشرشده</h2><p>اطلاعات زیر از منابع آموزشی موجود در ایتاتست میاد. جزئیات مطالعه و دسترسی رو در صفحه هر درس ببین.</p></div><CourseCatalog/></section>
    <p className="public-factual-note">ایتاتست همراه آمادگی توئه، نه برگزارکننده آزمون. شرایط ثبت‌نام، زمان‌بندی و ضوابط رسمی رو از منبع برگزارکننده بررسی کن. مسیرهای <bdi lang="en">IMAT</bdi> و <bdi lang="en">SAT</bdi> هنوز در دسترس نیستن.</p>
  </div>
}
`)
write('src/pages/public/DiagnosticIntroPage.tsx',`
import { BarChart3, Clock3, ListChecks, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { JourneyNav } from '../../components/JourneyNav'
import { Badge, Card } from '../../components/UI'

export function DiagnosticIntroPage() {
  return <div className="container public-content-page public-assessment-intro">
    <div className="journey-wrap"><JourneyNav/></div>
    <div className="public-intro-grid"><div className="public-intro-copy"><Badge tone="learning">شروع مسیر آمادگی</Badge><h1>قبل از مطالعه،<br/>قدم بعدی رو بشناس.</h1><p>یک درس یا مبحث رو انتخاب کن، به سؤال‌ها پاسخ بده و ببین کدوم بخش‌ها به مرور بیشتری نیاز دارن. نتیجه و پیشنهاد مطالعه، مربوط به همون موضوع انتخابی توئه.</p>
      <ul className="public-intro-facts"><li><Clock3 aria-hidden="true"/> حداکثر ۶۰ دقیقه</li><li><ListChecks aria-hidden="true"/> سؤال‌های چندگزینه‌ای</li><li><BarChart3 aria-hidden="true"/> نتیجه موضوعی</li></ul>
      <Link className="button button-primary button-large" to="/diagnostic/test">شروع آزمون</Link><p className="public-supporting">برای ثبت نتیجه در حسابت، اول وارد می‌شی.</p>
    </div>
    <Card variant="learning" className="public-outcomes"><h2>در پایان چه چیزی می‌بینی؟</h2><ul><li><strong>درصد پاسخ‌های درست</strong><p>نتیجه پاسخ‌هات به سؤال‌های ارزیابی.</p></li><li><strong>مباحث نیازمند مرور</strong><p>عملکردت در همون درس و مبحث انتخاب‌شده.</p></li><li><strong>پیشنهاد برای ادامه</strong><p>یک قدم بعدی براساس عملکرد موضوعی تو.</p></li></ul><div className="public-privacy"><ShieldCheck aria-hidden="true"/><p>نتیجه و پاسخ‌هات پس از ثبت، در حساب شخصی‌ات ذخیره می‌شن.</p></div></Card></div>
  </div>
}
`)
