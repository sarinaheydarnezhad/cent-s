import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { completeGoogleSignIn, googleAuthError } from '../../services/google-auth'
import { useAppState } from '../../state/AppState'

export function GoogleCallbackPage() {
  const [error, setError] = useState('')
  const { authenticated } = useAppState()
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    completeGoogleSignIn().then(result => {
      if (!active) return
      authenticated(result.user, result.token, result.expiresAt)
      navigate(result.returnTo || (result.user.role === 'ADMIN' ? '/admin' : '/student'), { replace: true })
    }).catch(reason => { if (active) setError(googleAuthError(reason)) })
    return () => { active = false }
  }, [authenticated, navigate])
  return <main className="auth-callback-page"><section className="auth-card" aria-labelledby="google-callback-title">
    <span className="pill"><ShieldCheck aria-hidden="true"/> ورود امن به Cent</span>
    <h1 id="google-callback-title">ورود با گوگل</h1>
    {error ? <><p className="inline-error" role="alert">{error}</p><Link className="button button-primary button-block" to="/login" replace>بازگشت به ورود و تلاش دوباره</Link></> : <p role="status" aria-live="polite">در حال تکمیل ورود با گوگل…</p>}
  </section></main>
}
