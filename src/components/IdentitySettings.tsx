import { useCallback, useRef, useState } from 'react'
import { useAppState } from '../state/AppState'
import type { AuthSession } from '../services/cent'
import { GoogleSignIn } from './GoogleSignIn'
import { SmsSignIn } from './SmsSignIn'
export function IdentitySettings() {
  const { authenticated } = useAppState()
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const begin = useCallback(() => { if (lock.current) return false; lock.current = true; setBusy(true); setMessage(''); return true }, [])
  const release = useCallback(() => { lock.current = false; setBusy(false) }, [])
  const success = useCallback((session: AuthSession) => {
    authenticated(session.user, session.token, session.expiresAt)
    setMessage('روش ورود با موفقیت به همین حساب متصل شد.')
  }, [authenticated])
  return <section className="card"><h2>اتصال روش ورود</h2>
    <p>با تأیید مالکیت، شماره موبایل یا حساب گوگل را به همین حساب متصل کنید. حساب‌های جداگانه خودکار ادغام نمی‌شوند.</p>
    {message && <p role="status">{message}</p>}
    <SmsSignIn link disabled={busy} begin={begin} release={release} success={success}/>
    <div className="auth-divider"><span>اتصال حساب گوگل</span></div>
    <GoogleSignIn link disabled={busy} begin={begin} release={release} success={success}/>
  </section>
}
