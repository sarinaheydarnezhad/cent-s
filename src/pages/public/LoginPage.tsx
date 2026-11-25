import { useCallback, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { isAdminRole } from '../../services/admin'
import { useAppState } from '../../state/AppState'
import type { AuthSession } from '../../services/cent'
import { safeReturnTo } from '../../services/auth-navigation'
import { GoogleSignIn } from '../../components/GoogleSignIn'
import { SmsSignIn } from '../../components/SmsSignIn'
import { PasswordSignIn } from '../../components/PasswordSignIn'
import { Notice } from '../../components/UI'

const authModes = {
  sms: 'ورود با کد پیامکی',
  password: 'ورود با رمز عبور',
  register: 'ثبت‌نام با رمز عبور',
  recovery: 'فراموشی یا تنظیم رمز عبور',
} as const

export function LoginPage() {
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<keyof typeof authModes>('sms')
  const [passwordReset, setPasswordReset] = useState(false)
  const submitting = useRef(false)
  const { authenticated } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const next = safeReturnTo((location.state as { from?: string } | null)?.from)
  const success = useCallback((result: AuthSession) => {
    authenticated(result.user, result.token, result.expiresAt)
    navigate(next || (isAdminRole(result.user.role) ? '/admin' : '/student'), { replace: true })
  }, [authenticated, navigate, next])
  const begin = useCallback(() => {
    if (submitting.current) return false
    submitting.current = true; setBusy(true); return true
  }, [])
  const release = useCallback(() => { submitting.current = false; setBusy(false) }, [])
  return <div className="auth-page public-auth">
    <aside className="auth-visual"><div className="auth-visual-content">
      <span className="eyebrow">ایتاتست · CEnT-S</span><h2>مسیر یادگیری‌ات را ادامه بده</h2>
      <p>درس‌ها، یادداشت‌ها و نتیجه آزمون‌هایت در حساب ایتاتست محفوظ می‌مانند.</p>
      <Link className="text-link" to="/exam">آشنایی با مسیر آمادگی</Link>
    </div></aside>
    <div className="auth-panel"><section className="auth-card" aria-labelledby="auth-title">
      <Link className="eyebrow" to="/">ایتاتست</Link>
      <h1 id="auth-title">{mode === 'sms' ? 'ورود یا ثبت‌نام' : authModes[mode]}</h1>
      {mode === 'sms' && <p className="public-auth-description">با شماره موبایل یا حساب گوگل وارد شوید. اگر حساب ندارید، برایتان ساخته می‌شود.</p>}
      {mode === 'recovery' && <p className="public-auth-description">شماره موبایل تأییدشده حساب خود را وارد کنید.</p>}
      {passwordReset && <Notice tone="success" live="polite">رمز عبور ذخیره شد. با رمز جدید وارد شوید.</Notice>}
      {mode === 'password' ? <PasswordSignIn disabled={busy} begin={begin} release={release} success={success}/> :
        <SmsSignIn key={mode} disabled={busy} begin={begin} release={release} success={success} register={mode === 'register'}
          onPasswordReset={mode === 'recovery' ? () => { setPasswordReset(true); setMode('password') } : undefined}/>}
      <div className="auth-sms-actions">
        {(Object.keys(authModes) as (keyof typeof authModes)[]).filter(option => option !== mode).map(option =>
          <button key={option} className="button button-ghost" type="button" disabled={busy} onClick={() => { setPasswordReset(false); setMode(option) }}>{authModes[option]}</button>)}
      </div>
      <div hidden={mode !== 'sms'}>
        <div className="auth-divider"><span>یا با گوگل ادامه دهید</span></div>
        <GoogleSignIn disabled={busy} begin={begin} release={release} success={success}/>
      </div>
      <p className="auth-security"><ShieldCheck aria-hidden="true"/> حساب و دسترسی‌های آموزشی شما مخصوص ایتاتست است.</p>
    </section></div>
  </div>
}
