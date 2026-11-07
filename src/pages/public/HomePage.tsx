import { ArrowLeft, BookOpen, Check, ClipboardCheck, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CourseCatalog } from '../CourseCatalog'
import { useRemote } from '../../components/CentUI'
import { cent } from '../../services/cent'

export function HomePage() {
  const remote = useRemote(cent.curriculum)
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy">
      <span className="pill"><Sparkles size={16}/> آمادگی هدفمند برای CEnT-S</span>
      <h1>از منابع درست،<br/><em>قدم‌به‌قدم</em> یاد بگیر.</h1>
      <p>درس‌نامه‌ها را بخوان، در هر مبحث تمرین کن و با ارزیابی، نقاط قوت و مباحث نیازمند مرور را بشناس.</p>
      <div className="hero-actions"><Link className="button button-primary button-large" to="/diagnostic/intro">تعیین سطح را شروع کن <ArrowLeft size={19}/></Link><Link className="button button-secondary button-large" to="/package">مشاهده درس‌ها</Link></div>
      <div className="trust-row"><span><Check/> ارزیابی موضوعی</span><span><Check/> پاسخ تشریحی</span><span><Check/> پیگیری پیشرفت</span></div>
    </div><div className="hero-visual"><div className="score-orbit"><span>درس‌های منتشرشده</span><strong>{remote.data?.courses.length ?? '—'}</strong><BookOpen size={40}/></div><div className="float-card float-card-top"><BookOpen/><div><b>درس‌نامه‌های منبع</b><span>{remote.data?.documents.length ?? '—'} درس‌نامه</span></div></div><div className="float-card float-card-bottom"><ClipboardCheck/><div><b>بانک سؤال</b><span>{remote.data?.topics.reduce((sum, t) => sum + t.questionCount, 0) ?? '—'} سؤال</span></div></div></div></div></section>
    <section className="section light-section"><div className="container"><div className="section-heading centered"><span className="eyebrow">منابع آموزشی شما</span><h2>درس‌ها و فصل‌های واقعی</h2><p>هر درس به منابع، مباحث و سؤال‌های خودش متصل است.</p></div><CourseCatalog/></div></section>
    <section className="section"><div className="container feature-grid"><article><ClipboardCheck/><h3>سنجش هر مهارت</h3><p>یک درس یا مبحث را انتخاب کن و نتیجه پاسخ‌هایت را ببین.</p></article><article><BookOpen/><h3>مطالعه و تمرین</h3><p>منبع هر درس را بخوان و نکته‌های شخصی‌ات را همان‌جا ذخیره کن.</p></article><article><Compass/><h3>نقشه یادگیری</h3><p>پیشرفت هر مبحث را در کنار پوشش ارزیابی و پیشرفت کل درس ببین.</p></article></div></section>
  </>
}
