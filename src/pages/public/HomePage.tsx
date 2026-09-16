import { ArrowLeft, BarChart3, BookOpenCheck, BrainCircuit, Check, ClipboardCheck, Compass, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="pill"><Sparkles size={16}/> آمادگی هدفمند برای CEnT-S</span>
          <h1>به‌جای مطالعه بیشتر،<br/><em>درست‌تر</em> مطالعه کن.</h1>
          <p>Cent-s با تعیین سطح، تحلیل دقیق ریاضیات و منطق و یک مسیر روشن، کمک می‌کند بفهمی کجا هستی و قدم بعدی چیست.</p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/diagnostic/intro">تعیین سطح را شروع کن <ArrowLeft size={19}/></Link>
            <Link className="button button-secondary button-large" to="/package">مشاهده پکیج آمادگی</Link>
          </div>
          <div className="trust-row"><span><Check/> بدون نیاز به پرداخت</span><span><Check/> نتیجه موضوعی</span><span><Check/> تحلیل شخصی‌سازی‌شده</span></div>
        </div>
        <div className="hero-visual">
          <div className="score-orbit"><span>امتیاز آمادگی</span><strong>۶۸<small>٪</small></strong><div className="mini-bars"><i style={{height:'55%'}}/><i style={{height:'75%'}}/><i style={{height:'45%'}}/><i style={{height:'88%'}}/><i style={{height:'68%'}}/></div></div>
          <div className="float-card float-card-top"><Target/><div><b>اولویت امروز</b><span>استدلال شرطی</span></div></div>
          <div className="float-card float-card-bottom"><BrainCircuit/><div><b>تحلیل آماده شد</b><span>۳ نقطه قوت · ۲ اولویت</span></div></div>
          <div className="dot-pattern" />
        </div>
      </div>
    </section>

    <section className="section light-section">
      <div className="container">
        <div className="section-heading centered"><span className="eyebrow">چرا Cent-s؟</span><h2>از سردرگمی تا یک مسیر قابل اجرا</h2><p>محتوا وقتی ارزشمند است که بدانی کدام بخش را، چرا و در چه زمانی بخوانی.</p></div>
        <div className="feature-grid">
          <article><span className="feature-number">۰۱</span><ClipboardCheck/><h3>تعیین سطح</h3><p>با سؤال‌های واقعی ریاضیات و منطق، تصویر اولیه‌ای از سطح هر مبحث بساز.</p></article>
          <article className="featured"><span className="feature-number">۰۲</span><BrainCircuit/><h3>تحلیل هوشمند</h3><p>نمره‌ها قطعی و محاسباتی‌اند؛ AI فقط آن‌ها را تفسیر و اولویت مطالعه را روشن می‌کند.</p></article>
          <article><span className="feature-number">۰۳</span><Compass/><h3>قدم بعدی روشن</h3><p>به‌جای یک داشبورد شلوغ، دقیقاً بدان جلسه بعدی روی چه چیزی تمرکز کنی.</p></article>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container split-section">
        <div className="result-preview card">
          <div className="preview-head"><div><span>نمونه تحلیل تعیین سطح</span><b>عملکرد موضوعی</b></div><BarChart3/></div>
          {[['جبر',82,'success'],['احتمال',48,'warning'],['استدلال شرطی',36,'danger'],['دنباله منطقی',71,'primary']].map(([label,value,tone]) => <div className="preview-row" key={label as string}><span>{label}<b>{value}٪</b></span><div className="progress-track"><i className={tone as string} style={{width:`${value}%`}}/></div></div>)}
        </div>
        <div className="section-copy"><span className="eyebrow">تحلیل، نه فقط نمره</span><h2>اشتباه‌ها باید به یک تصمیم بهتر منتهی شوند.</h2><p>در صفحه نتیجه فقط یک درصد نمی‌بینی. عملکرد هر درس و موضوع، نقاط قوت، ضعف‌ها و اولویت پیشنهادی کنار هم قرار می‌گیرند.</p><ul className="check-list"><li><ShieldCheck/> نمره‌دهی قطعی و مستقل از AI</li><li><BookOpenCheck/> اتصال ضعف‌ها به محتوای مرتبط</li><li><Target/> پیشنهاد مشخص برای شروع مطالعه</li></ul><Link to="/diagnostic/intro" className="text-link">سطحم را ارزیابی می‌کنم <ArrowLeft/></Link></div>
      </div>
    </section>

    <section className="section cta-section"><div className="container cta-box"><div><span>برای شروع آماده‌ای؟</span><h2>۱۲ سؤال تا شناخت بهتر مسیرت</h2><p>تعیین سطح این نسخه آزمایشی رایگان است و حدود ۱۰ دقیقه زمان می‌برد.</p></div><Link className="button button-light button-large" to="/diagnostic/intro">شروع تعیین سطح <ArrowLeft/></Link></div></section>
  </>
}
