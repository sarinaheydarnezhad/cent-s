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
  password: 'ورود به حساب',
  register: 'ساخت حساب کاربری',
  recovery: 'بازیابی رمز عبور',
} as const

export function LoginPage() {
  const [busy, setBusy] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const submitting = useRef(false)
  const { authenticated } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const loginState = location.state as { from?: string; recovery?: boolean } | null
  const [mode, setMode] = useState<keyof typeof authModes>(loginState?.recovery ? 'recovery' : 'password')
  const next = safeReturnTo(loginState?.from)
  const success = useCallback((result: AuthSession) => {
    authenticated(result.user, result.token, result.expiresAt)
    navigate(next || (isAdminRole(result.user.role) ? '/admin' : '/student'), { replace: true })
  }, [authenticated, navigate, next])
  const begin = useCallback(() => {
    if (submitting.current) return false
    submitting.current = true; setBusy(true); return true
  }, [])
  const release = useCallback(() => { submitting.current = false; setBusy(false) }, [])
  function selectMode(option: keyof typeof authModes) {
    setPasswordReset(false)
    setMode(option)
  }
  return <div className="auth-page public-auth">
    <aside className="auth-visual"><div className="auth-visual-content">
      <span className="eyebrow">ایتاتست · CEnT-S</span><h2>مسیر یادگیری‌ات را ادامه بده</h2>
      <p>درس‌ها، یادداشت‌ها و نتیجه آزمون‌هایت در حساب ایتاتست محفوظ می‌مانند.</p>
      <Link className="text-link" to="/exam">آشنایی با مسیر آمادگی</Link>
    </div></aside>
    <div className="auth-panel"><section className="auth-card" aria-labelledby="auth-title">
      <Link className="eyebrow" to="/">ایتاتست</Link>
      <h1 id="auth-title">{authModes[mode]}</h1>
      <p className="public-auth-description">{{
        password: 'با شماره موبایل و رمز عبور وارد شوید.',
        register: 'شماره موبایل خود را تأیید کنید و برای حسابتان رمز عبور بسازید.',
        recovery: 'برای تنظیم رمز عبور، شماره موبایل تأییدشده حساب خود را وارد کنید.',
      }[mode]}</p>
      {passwordReset && <Notice tone="success" live="polite">رمز عبور ذخیره شد. با رمز جدید وارد شوید.</Notice>}
      {mode === 'password' ? <PasswordSignIn disabled={busy} begin={begin} release={release} success={success}/> :
        <SmsSignIn key={mode} mode={mode} disabled={busy} begin={begin} release={release} success={success}
          onPasswordReset={mode === 'recovery' ? () => { setPasswordReset(true); setMode('password') } : undefined}/>}
      {mode === 'password' ? <>
        <button className="button button-ghost auth-recovery-link" type="button" disabled={busy} onClick={() => selectMode('recovery')}>رمز عبور را فراموش کرده‌اید؟</button>
        <div className="auth-divider"><span>یا</span></div>
        <GoogleSignIn disabled={busy} begin={begin} release={release} success={success}/>
        <div className="auth-mode-footer">
          <span>حساب ندارید؟</span>
          <button className="button button-secondary" type="button" disabled={busy} onClick={() => selectMode('register')}>ثبت‌نام</button>
        </div>
      </> : <div className="auth-mode-footer">
        <button className="button button-ghost" type="button" disabled={busy} onClick={() => selectMode('password')}>بازگشت به ورود</button>
      </div>}
      <p className="auth-security"><ShieldCheck aria-hidden="true"/> حساب و دسترسی‌های آموزشی شما مخصوص ایتاتست است.</p>
    </section></div>
  </div>
}
