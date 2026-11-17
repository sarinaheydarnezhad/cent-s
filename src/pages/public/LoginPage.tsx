import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ShieldCheck } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { cent, type AuthSession } from '../../services/cent'
import { safeReturnTo } from '../../services/google-auth'
import { GoogleSignIn } from '../../components/GoogleSignIn'

export function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const submitting = useRef(false)
  const [error, setError] = useState('')
  const { authenticated } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const next = safeReturnTo((location.state as { from?: string } | null)?.from)
  const finishSignIn = useCallback((result: AuthSession) => {
    authenticated(result.user, result.token, result.expiresAt)
    navigate(next || (result.user.role === 'ADMIN' ? '/admin' : '/student'), { replace: true })
  }, [authenticated, navigate, next])
  const beginGoogle = useCallback(() => {
    if (submitting.current) return false
    submitting.current = true; setGoogleBusy(true); setError(''); return true
  }, [])
  const releaseGoogle = useCallback(() => { submitting.current = false; setGoogleBusy(false) }, [])
  useEffect(() => {
    const resume = (event: PageTransitionEvent) => {
      if (event.persisted) { submitting.current = false; setGoogleBusy(false) }
    }
    window.addEventListener('pageshow', resume)
    return () => window.removeEventListener('pageshow', resume)
  }, [])
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setBusy(true); setError('')
    try {
      const result = await cent.authenticate(tab, { email, password, name })
      finishSignIn(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'ورود انجام نشد.') }
    finally { submitting.current = false; setBusy(false) }
  }
  const disabled = busy || googleBusy
  return <div className="auth-page">
    <div className="auth-visual"><div className="auth-visual-content">
      <span className="pill light"><BookOpen/> کتابخانه شخصی تو</span><h1>یادگیری،<br/>با جای خودت.</h1>
      <p>آموزش‌هایت، یادداشت‌های کنار هر صفحه و ادامه مطالعه‌ات، هر بار که برمی‌گردی در دسترس‌اند.</p>
      <Link className="button button-secondary" to="/package">دیدن آموزش‌ها</Link>
    </div></div>
    <div className="auth-panel"><form className="auth-card" onSubmit={submit} aria-busy={disabled}>
      <div className="auth-tabs">
        <button type="button" disabled={disabled} className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError('') }}>ورود</button>
        <button type="button" disabled={disabled} className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError('') }}>ثبت‌نام</button>
      </div>
      <h2>{tab === 'login' ? 'خوش برگشتی' : 'حساب Cent خودت را بساز'}</h2>
      <GoogleSignIn intent={tab} disabled={disabled} returnTo={next} begin={beginGoogle} release={releaseGoogle} success={finishSignIn}/>
      <div className="auth-divider"><span>یا با ایمیل</span></div>
      <div className="cent-form">
        {tab === 'register' && <label>نام و نام خانوادگی<input autoComplete="name" value={name} maxLength={120} disabled={disabled} onChange={e => setName(e.target.value)} required/></label>}
        <label>ایمیل<input type="email" dir="ltr" autoComplete="email" value={email} maxLength={256} disabled={disabled} onChange={e => setEmail(e.target.value)} required/></label>
        <label>رمز عبور<input type="password" dir="ltr" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={password} minLength={10} maxLength={128} disabled={disabled} onChange={e => setPassword(e.target.value)} required/><small>حداقل ۱۰ نویسه</small></label>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <button className="button button-primary button-block" disabled={disabled}>{busy ? 'در حال بررسی…' : tab === 'login' ? 'ورود به حساب' : 'ساخت حساب'}</button>
      </div>
      <p className="auth-security"><ShieldCheck/> حساب و خریدهای شما مخصوص Cent است.</p>
    </form></div>
  </div>
}
