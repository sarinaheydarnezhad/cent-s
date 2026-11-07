import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ShieldCheck } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { cent } from '../../services/cent'

export function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { authenticated } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await cent.authenticate(tab, { email, password, name })
      authenticated(result.user, result.token)
      const next = (location.state as { from?: string } | null)?.from
      navigate(next?.startsWith('/') && !next.startsWith('//') ? next : result.user.role === 'ADMIN' ? '/admin' : '/student', { replace: true })
    } catch (e) { setError(e instanceof Error ? e.message : 'ورود انجام نشد.') }
    finally { setBusy(false) }
  }
  return <div className="auth-page"><div className="auth-visual"><div className="auth-visual-content"><span className="pill light"><BookOpen/> کتابخانه شخصی تو</span><h1>یادگیری،<br/>با جای خودت.</h1><p>آموزش‌هایت، یادداشت‌های کنار هر صفحه و ادامه مطالعه‌ات، هر بار که برمی‌گردی در دسترس‌اند.</p><Link className="button button-secondary" to="/package">دیدن آموزش‌ها</Link></div></div><div className="auth-panel"><form className="auth-card" onSubmit={submit}><div className="auth-tabs"><button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError('') }}>ورود</button><button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError('') }}>ثبت‌نام</button></div><h2>{tab === 'login' ? 'خوش برگشتی' : 'حساب Cent خودت را بساز'}</h2><div className="cent-form">{tab === 'register' && <label>نام و نام خانوادگی<input autoComplete="name" value={name} maxLength={120} onChange={e => setName(e.target.value)} required/></label>}<label>ایمیل<input type="email" dir="ltr" autoComplete="email" value={email} maxLength={256} onChange={e => setEmail(e.target.value)} required/></label><label>رمز عبور<input type="password" dir="ltr" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={password} minLength={10} maxLength={128} onChange={e => setPassword(e.target.value)} required/><small>حداقل ۱۰ نویسه</small></label>{error && <p className="inline-error" role="alert">{error}</p>}<button className="button button-primary button-block" disabled={busy}>{busy ? 'در حال بررسی…' : tab === 'login' ? 'ورود به حساب' : 'ساخت حساب'}</button></div><p className="auth-security"><ShieldCheck/> حساب و خریدهای شما مخصوص Cent است.</p></form></div></div>
}
