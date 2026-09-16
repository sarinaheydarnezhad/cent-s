import { ArrowLeft, Check, CirclePlay, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { chapters, mainProduct } from '../../data/content'
import { useAppState } from '../../state/AppState'
import { JourneyNav } from '../../components/JourneyNav'

export function PackagePage() {
  const { hasPackage } = useAppState()
  return <div className="package-page">
    <div className="container journey-wrap package-journey"><JourneyNav/></div>
    <section className="package-hero"><div className="container"><span className="pill light"><Sparkles/> پکیج اصلی Cent-s</span><h1>یک مسیر منسجم برای<br/>ریاضیات و منطق</h1><p>از درس‌نامه و تمرین تا شبیه‌ساز و تحلیل عملکرد؛ اجزایی که برای مطالعه هدفمند لازم داری، در یک مسیر روشن.</p></div></section>
    <div className="container package-layout">
      <main>
        <section className="package-section"><span className="eyebrow">داخل پکیج</span><h2>مطالعه، تمرین، بازخورد</h2><div className="included-grid">{mainProduct.features.map((feature, index) => <article key={feature}><span>{String(index + 1).padStart(2,'0')}</span><Check/><b>{feature}</b></article>)}</div></section>
        <section className="package-section"><h2>نمونه ساختار محتوا</h2><div className="curriculum-list">{chapters.map((chapter, index) => <div className="curriculum-item" key={chapter.id}><div className="curriculum-icon">{index === 0 ? <CirclePlay/> : <LockKeyhole/>}</div><div><span>{chapter.subject}</span><h3>{chapter.title}</h3><p>{chapter.lessons.join(' · ')}</p></div><em>{index === 0 ? 'نمونه باز' : 'داخل پکیج'}</em></div>)}</div></section>
        <div className="honesty-note"><ShieldCheck/><div><b>بدون ادعای قبولی تضمینی</b><p>Cent-s ابزار مطالعه و ارزیابی است. نتیجه نهایی به شرایط آزمون، کیفیت مطالعه و عوامل متعدد دیگری وابسته است.</p></div></div>
      </main>
      <aside className="pricing-card card"><span className="pricing-label">دسترسی نسخه تمرینی</span><h2>{mainProduct.title}</h2><p>ریاضیات + منطق + شبیه‌ساز</p><div className="price"><del>{mainProduct.originalPrice?.toLocaleString('fa-IR')}</del><strong>{mainProduct.price.toLocaleString('fa-IR')}</strong><span>تومان</span></div><ul>{mainProduct.features.slice(0,5).map((feature) => <li key={feature}><Check/>{feature}</li>)}</ul>{hasPackage ? <Link className="button button-success button-block" to="/student/content">ورود به محتوای پکیج <ArrowLeft/></Link> : <Link className="button button-primary button-block" to="/checkout">خرید آزمایشی پکیج <ArrowLeft/></Link>}<div className="demo-payment-label">پرداخت این نسخه کاملاً MOCK است و تراکنش واقعی انجام نمی‌شود.</div></aside>
    </div>
  </div>
}
