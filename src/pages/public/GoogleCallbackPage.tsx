import { isAdminRole } from '../../services/admin'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { AppearanceControl } from '../../components/AppearanceControl'
import { Brand } from '../../components/Brand'
import { LoadingState, Notice } from '../../components/UI'
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
      navigate(result.returnTo || (isAdminRole(result.user.role) ? '/admin' : '/student'), { replace: true })
    }).catch(reason => { if (active) setError(googleAuthError(reason)) })
    return () => { active = false }
  }, [authenticated, navigate])
  return <div className="public-standalone"><header className="container public-standalone-header"><Brand/><AppearanceControl/></header><main className="auth-callback-page"><section className="auth-card" aria-labelledby="google-callback-title">
    <span className="pill"><ShieldCheck aria-hidden="true"/> ورود امن به ایتاتست</span>
    <h1 id="google-callback-title">ورود با گوگل</h1>
    {error ? <><Notice tone="error" live="assertive">{error}</Notice><Link className="button button-primary button-block" to="/login" replace>بازگشت به ورود و تلاش دوباره</Link></> : <LoadingState label="در حال تکمیل ورود با گوگل…"/>}
  </section></main></div>
}
