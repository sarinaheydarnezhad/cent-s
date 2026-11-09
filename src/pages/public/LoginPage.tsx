import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ShieldCheck } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { cent } from '../../services/cent'
import { googleAuthError, safeReturnTo, startGoogleSignIn } from '../../services/google-auth'

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
      authenticated(result.user, result.token, result.expiresAt)
      navigate(next || (result.user.role === 'ADMIN' ? '/admin' : '/student'), { replace: true })
    } catch (e) { setError(e instanceof Error ? e.message : 'ورود انجام نشد.') }
    finally { submitting.current = false; setBusy(false) }
  }
  async function googleSignIn() {
    if (submitting.current) return
    submitting.current = true; setGoogleBusy(true); setError('')
    try { await startGoogleSignIn(next) }
    catch (reason) { submitting.current = false; setGoogleBusy(false); setError(googleAuthError(reason)) }
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
      <button type="button" className="button button-secondary button-block auth-google" disabled={disabled} onClick={googleSignIn}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path fill="#4285F4" d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.42h11a9.4 9.4 0 0 1-4.08 6.18v5.14h6.61c3.86-3.55 6.08-8.78 6.08-14.82Z"/>
          <path fill="#34A853" d="M24 44c5.51 0 10.13-1.83 13.53-4.72l-6.61-5.14c-1.83 1.23-4.17 1.96-6.92 1.96-5.32 0-9.83-3.59-11.44-8.42H5.73v5.3A20 20 0 0 0 24 44Z"/>
          <path fill="#FBBC05" d="M12.56 27.68a12 12 0 0 1 0-7.36v-5.3H5.73a20 20 0 0 0 0 17.96l6.83-5.3Z"/>
          <path fill="#EA4335" d="M24 11.9c3 0 5.69 1.03 7.81 3.04l5.86-5.86A19.63 19.63 0 0 0 24 4 20 20 0 0 0 5.73 15.02l6.83 5.3C14.17 15.49 18.68 11.9 24 11.9Z"/>
        </svg>
        {googleBusy ? 'در حال انتقال به گوگل…' : tab === 'login' ? 'ورود با گوگل' : 'ثبت‌نام با گوگل'}
      </button>
      {googleBusy && <p className="auth-google-status" role="status">در حال انتقال به گوگل…</p>}
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
