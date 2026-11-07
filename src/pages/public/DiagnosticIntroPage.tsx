import { ArrowLeft, BarChart3, Clock3, ListChecks, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { JourneyNav } from '../../components/JourneyNav'

export function DiagnosticIntroPage() {
  return <><div className="container journey-wrap"><JourneyNav/></div><div className="container diagnostic-intro">
    <div className="intro-copy"><span className="pill">تعیین سطح رایگان</span><h1>قبل از شروع مطالعه، موقعیت فعلی‌ات را بشناس.</h1><p>از میان درس‌ها و مباحث منابع آموزشی، موضوع ارزیابی را انتخاب کن و گزارش عملکرد و پیشنهاد مطالعه بگیر. برای نگه‌داشتن نتایج، ابتدا وارد حسابت شو.</p>
      <div className="intro-facts"><span><Clock3/> حداکثر ۶۰ دقیقه</span><span><ListChecks/> سؤال‌های چندگزینه‌ای</span><span><BarChart3/> تحلیل موضوعی</span></div>
      <Link className="button button-primary button-large" to="/diagnostic/test">شروع آزمون <ArrowLeft/></Link>
    </div>
    <div className="intro-panel card"><h3>در پایان چه می‌بینی؟</h3><ul className="timeline-list"><li><span>۱</span><div><b>درصد پاسخ‌های صحیح</b><p>محاسبه مستقیم از پاسخ‌های تو</p></div></li><li><span>۲</span><div><b>قوت و ضعف موضوعی</b><p>مهارت‌های همان درس و مبحث انتخاب‌شده</p></div></li><li><span>۳</span><div><b>تحلیل قابل توضیح</b><p>پیشنهاد براساس عملکرد موضوعی</p></div></li><li><span>۴</span><div><b>قدم بعدی</b><p>یک پیشنهاد مشخص برای ادامه</p></div></li></ul><div className="privacy-note"><ShieldCheck/> نتیجه و پاسخ‌ها پس از ثبت، در حساب شخصی شما ذخیره می‌شوند.</div></div>
  </div></>
}
