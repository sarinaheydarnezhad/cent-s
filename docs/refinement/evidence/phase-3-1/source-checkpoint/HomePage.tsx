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
    <section className="public-section container public-resources" aria-labelledby="resources-title"><div className="public-section-heading"><span className="eyebrow">از همین‌جا شروع کن</span><h2 id="resources-title">درس‌ها و منابع آمادگی</h2><p>فصل‌ها و مباحث هر درس رو ببین. جزئیات دسترسی به درس‌نامه‌ها در صفحه هر درس مشخصه.</p></div><CourseCatalog actionVariant="secondary" compact/></section>
    <section className="container public-final-section" aria-labelledby="next-title"><div className="public-final"><div><span className="eyebrow">قدم بعدی تو</span><h2 id="next-title">اول ببین کجا ایستادی.</h2><p>با یک ارزیابی موضوعی شروع کن؛ بعد، مباحث نیازمند مرور رو دقیق‌تر انتخاب کن.</p></div><Link className="button button-primary button-large" to="/diagnostic/intro">شروع ارزیابی سطح</Link></div></section>
  </div>
}
