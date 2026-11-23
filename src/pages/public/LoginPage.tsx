import { useCallback, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { isAdminRole } from '../../services/admin'
import { useAppState } from '../../state/AppState'
import type { AuthSession } from '../../services/cent'
import { safeReturnTo } from '../../services/auth-navigation'
import { GoogleSignIn } from '../../components/GoogleSignIn'
import { SmsSignIn } from '../../components/SmsSignIn'
export function LoginPage() {
  const [busy, setBusy] = useState(false)
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
      <h1 id="auth-title">ورود یا ثبت‌نام</h1>
      <p className="public-auth-description">با شماره موبایل یا حساب گوگل وارد شوید. اگر حساب ندارید، برایتان ساخته می‌شود.</p>
      <SmsSignIn disabled={busy} begin={begin} release={release} success={success}/>
      <div className="auth-divider"><span>یا با گوگل ادامه دهید</span></div>
      <GoogleSignIn disabled={busy} begin={begin} release={release} success={success}/>
      <p className="auth-security"><ShieldCheck aria-hidden="true"/> حساب و دسترسی‌های آموزشی شما مخصوص ایتاتست است.</p>
    </section></div>
  </div>
}
