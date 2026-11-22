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
