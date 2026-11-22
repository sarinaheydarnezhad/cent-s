import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, NotebookPen, ShieldCheck } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { cent, type AuthSession } from '../../services/cent'
import { safeReturnTo } from '../../services/google-auth'
import { GoogleSignIn } from '../../components/GoogleSignIn'
import { Button, FilterGroup, Notice } from '../../components/UI'
import { InputField } from '../../components/Fields'

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
  return <div className="auth-page public-auth">
    <aside className="auth-visual"><div className="auth-visual-content">
      <BookOpen className="public-auth-symbol" size={64} strokeWidth={1.25} aria-hidden="true"/><span className="eyebrow">فضای یادگیری تو در ایتاتست</span><h2>هر بار که برمی‌گردی،<br/>از جای خودت ادامه بده.</h2>
      <p>درس‌نامه‌ها، یادداشت‌ها و نتیجه ارزیابی‌ات رو در حسابت داشته باش؛ برای قدم بعدی، با دید روشن‌تر.</p>
      <div className="public-auth-note"><NotebookPen aria-hidden="true"/><span>مطالعه، تمرین و مرور؛ در یک مسیر.</span></div>
      <Link className="text-link" to="/exam">آشنایی با مسیر آمادگی</Link>
    </div></aside>
    <div className="auth-panel"><form className="auth-card" onSubmit={submit} aria-busy={disabled} aria-labelledby="auth-title">
      <FilterGroup className="auth-tabs" label="ورود یا ثبت‌نام" value={tab} options={[{value:'login',label:'ورود'},{value:'register',label:'ثبت‌نام'}]} disabled={disabled} onChange={value => { setTab(value); setError('') }}/>
      <h1 id="auth-title">{tab === 'login' ? 'خوش برگشتی' : 'حساب ایتاتست خودت رو بساز'}</h1>
      <p className="public-auth-description">{tab === 'login' ? 'وارد شو و مسیر یادگیری‌ات رو ادامه بده.' : 'برای ذخیره نتیجه‌ها و ادامه مطالعه، حسابت رو بساز.'}</p>
      <GoogleSignIn intent={tab} disabled={disabled} returnTo={next} begin={beginGoogle} release={releaseGoogle} success={finishSignIn}/>
      <div className="auth-divider"><span>یا با ایمیل</span></div>
      <div className="cent-form">
        {tab === 'register' && <InputField label="نام و نام خانوادگی" autoComplete="name" value={name} maxLength={120} disabled={disabled} onChange={e => setName(e.target.value)} required/>}
        <InputField label="ایمیل" type="email" dir="ltr" autoComplete="email" value={email} maxLength={256} disabled={disabled} onChange={e => setEmail(e.target.value)} required/>
        <InputField label="رمز عبور" type="password" dir="ltr" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={password} minLength={10} maxLength={128} disabled={disabled} onChange={e => setPassword(e.target.value)} required hint="حداقل ۱۰ نویسه"/>
        {error && <Notice tone="error" live="assertive">{error}</Notice>}
        <Button type="submit" fullWidth disabled={disabled} loading={busy} loadingLabel="در حال بررسی…">{tab === 'login' ? 'ورود به حساب' : 'ساخت حساب'}</Button>
      </div>
      <p className="auth-security"><ShieldCheck aria-hidden="true"/> حساب و دسترسی‌های آموزشی‌ات مخصوص ایتاتسته.</p>
    </form></div>
  </div>
}
