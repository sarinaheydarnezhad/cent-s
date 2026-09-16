import { ArrowLeft, BookOpenCheck, BrainCircuit, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../../state/AppState'

export function LoginPage() {
  const [tab, setTab] = useState<'login'|'register'>('login')
  const { login } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  function enter(role: 'STUDENT'|'ADMIN') {
    login(role)
    const intended = (location.state as { from?: string } | null)?.from
    navigate(intended || (role === 'ADMIN' ? '/admin' : '/student'))
  }
  return <div className="auth-page"><div className="auth-visual"><div className="auth-orb one">π</div><div className="auth-orb two">A+</div><div className="auth-visual-content"><span className="pill light"><Sparkles/> نسخه تمرینی</span><h1>ادامه مسیر آمادگی، از همین‌جا.</h1><p>هر آزمون یک نشانه است؛ با تحلیل درست، قدم بعدی‌ات را دقیق‌تر انتخاب کن.</p><div className="auth-benefits"><span><BrainCircuit/><b>تحلیل شخصی</b><small>نقاط قوت و مسیر بهبود</small></span><span><BookOpenCheck/><b>یادگیری هدفمند</b><small>محتوای مناسب هر مبحث</small></span></div><div className="study-streak"><i>۷</i><div><b>روز همراهی پیوسته</b><small>یک قدم کوچک، هر روز</small></div></div></div></div><div className="auth-panel"><div className="auth-card"><div className="auth-welcome"><span>خوش آمدی 👋</span><small>فضای یادگیری تو آماده است</small></div><div className="auth-tabs"><button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>ورود</button><button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>ثبت‌نام</button></div><h2>{tab === 'login' ? 'ورود به حساب Cent-s' : 'ساخت حساب آزمایشی'}</h2><p>{tab === 'login' ? 'نقش موردنظرت را انتخاب کن و وارد محیط تمرینی شو.' : 'در نسخه تمرینی، ثبت‌نام به همان حساب دانشجوی دمو متصل می‌شود.'}</p><div className="demo-account"><UserRound/><div><b>حساب دانشجو</b><span dir="ltr">student@cent-s.demo</span></div><button className="button button-primary" onClick={() => enter('STUDENT')}>ورود <ArrowLeft/></button></div><div className="demo-account admin-account"><LockKeyhole/><div><b>حساب مدیر</b><span dir="ltr">admin@cent-s.demo</span></div><button className="button button-secondary" onClick={() => enter('ADMIN')}>ورود ادمین</button></div><div className="auth-security"><ShieldCheck/> ورود فعلی نمایشی است و برای محیط واقعی نیاز به احراز هویت امن دارد.</div></div></div></div>
}
