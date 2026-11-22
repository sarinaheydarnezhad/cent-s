import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from '../services/cent'
import { googleAuthError, startGoogleSignIn } from '../services/google-auth'
import { discoverGoogle, googleIdentityError, googleRetryDelay, type GoogleConfig } from '../services/google-identity-api'
import { googleIdentityAttempt, type GoogleStage } from '../services/google-identity'

interface Props {
  intent: 'login' | 'register'
  disabled: boolean
  returnTo?: string
  begin: () => boolean
  release: () => void
  success: (session: AuthSession) => void
}
const messages: Record<GoogleStage | 'config', string> = {
  config: 'در حال بررسی ورود با گوگل…', sdk: 'در حال بارگذاری سرویس گوگل…',
  challenge: 'در حال آماده‌سازی ورود امن…', ready: '',
  waiting: 'ورود را در پنجرهٔ گوگل ادامه دهید. اگر پنجره بسته شد، دوباره تلاش کنید.',
  verifying: 'در حال بررسی حساب گوگل…', expired: 'مهلت ورود با گوگل پایان یافته است. دوباره تلاش کنید.',
}

export function GoogleSignIn({ intent, disabled, returnTo, begin, release, success }: Props) {
  const target = useRef<HTMLDivElement>(null)
  const [config, setConfig] = useState<GoogleConfig>()
  const [stage, setStage] = useState<GoogleStage | 'config'>('config')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [retrySeconds, setRetrySeconds] = useState(0)
  const [codeBusy, setCodeBusy] = useState(false)

  useEffect(() => {
    let active = true
    const abort = new AbortController()
    let attempt: ReturnType<typeof googleIdentityAttempt> | undefined
    let restoreReferrer: (() => void) | undefined
    const onError = (reason: unknown) => {
      if (active) { setError(googleIdentityError(reason)); setRetrySeconds(Math.ceil(googleRetryDelay() / 1000)) }
    }
    // Defer initial work so React StrictMode's discarded effect sends no auth requests.
    void Promise.resolve().then(async () => {
      if (!active) return
      try {
        const selected = await discoverGoogle(abort.signal)
        if (!active) return
        setConfig(selected)
        if (selected.enabled && selected.mode === 'GisIdToken' && target.current) {
          // GIS needs the relying-party origin. Scope Google's documented policy to
          // this login view; the code callback keeps its existing no-referrer policy.
          const meta = document.querySelector<HTMLMetaElement>('meta[name="referrer"]')
          if (meta) {
            const previous = meta.content
            meta.content = window.location.protocol === 'http:' && window.location.hostname === 'localhost' ? 'no-referrer-when-downgrade' : 'strict-origin-when-cross-origin'
            restoreReferrer = () => { meta.content = previous }
          }
          attempt = googleIdentityAttempt(selected.clientId!, target.current, { stage: setStage, begin, release, success, error: onError })
        } else setStage('ready')
      } catch (reason) { onError(reason) }
    })
    const focus = () => attempt?.checkExpiry()
    window.addEventListener('focus', focus)
    return () => { active = false; abort.abort(); attempt?.dispose(); restoreReferrer?.(); window.removeEventListener('focus', focus) }
  }, [revision, begin, release, success])

  useEffect(() => {
    if (!retrySeconds) return
    const timer = setTimeout(() => setRetrySeconds(Math.ceil(googleRetryDelay() / 1000)), 1000)
    return () => clearTimeout(timer)
  }, [retrySeconds])

  function retry() {
    setError(''); setStage('config'); setConfig(undefined); setRevision(value => value + 1)
  }
  async function authorizationCode() {
    if (!begin()) return
    setCodeBusy(true); setError('')
    try { await startGoogleSignIn(returnTo) }
    catch (reason) { setCodeBusy(false); release(); setError(googleAuthError(reason)) }
  }
  const codeFlow = config?.enabled && config.mode === 'AuthorizationCode'
  const gis = config?.enabled && config.mode === 'GisIdToken'
  const canRetry = !!error || stage === 'expired' || stage === 'waiting'
  return <div className="auth-google-section">
    {codeFlow && <button type="button" className="button button-secondary button-block auth-google" disabled={disabled} onClick={authorizationCode}>
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="#4285F4" d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.42h11a9.4 9.4 0 0 1-4.08 6.18v5.14h6.61c3.86-3.55 6.08-8.78 6.08-14.82Z"/>
        <path fill="#34A853" d="M24 44c5.51 0 10.13-1.83 13.53-4.72l-6.61-5.14c-1.83 1.23-4.17 1.96-6.92 1.96-5.32 0-9.83-3.59-11.44-8.42H5.73v5.3A20 20 0 0 0 24 44Z"/>
        <path fill="#FBBC05" d="M12.56 27.68a12 12 0 0 1 0-7.36v-5.3H5.73a20 20 0 0 0 0 17.96l6.83-5.3Z"/>
        <path fill="#EA4335" d="M24 11.9c3 0 5.69 1.03 7.81 3.04l5.86-5.86A19.63 19.63 0 0 0 24 4 20 20 0 0 0 5.73 15.02l6.83 5.3C14.17 15.49 18.68 11.9 24 11.9Z"/>
      </svg>
      {codeBusy && disabled ? 'در حال انتقال به گوگل…' : intent === 'register' ? 'ثبت‌نام با گوگل' : 'ورود با گوگل'}
    </button>}
    {/* Google owns the button contents and branding. Inert blocks interaction during password/verification requests. */}
    <div ref={target} className="auth-google-sdk" inert={disabled || !gis || !!error || stage === 'expired'} hidden={!gis || !!error || stage === 'expired'} />
    {error ? <p className="inline-error" role="alert">{error}</p> : config && !config.enabled ? <p className="auth-google-status" role="status">ورود با گوگل فعلاً در دسترس نیست. می‌توانید با ایمیل وارد شوید.</p> :
      <p className="auth-google-status" role="status" aria-live="polite">{codeBusy && disabled ? 'در حال انتقال به گوگل…' : messages[stage]}</p>}
    {canRetry && <button type="button" className="button button-ghost button-block" disabled={retrySeconds > 0 || (disabled && stage !== 'waiting')} onClick={retry}>
      {retrySeconds ? `تلاش دوباره پس از ${retrySeconds} ثانیه` : stage === 'waiting' ? 'لغو و تلاش دوباره' : 'تلاش دوباره برای ورود با گوگل'}
    </button>}
  </div>
}
