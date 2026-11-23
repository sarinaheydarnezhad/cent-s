import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from '../services/cent'
import { discoverGoogle, googleIdentityError, googleRetryDelay, type GoogleConfig } from '../services/google-identity-api'
import { googleIdentityAttempt, type GoogleStage } from '../services/google-identity'

interface Props {
  disabled: boolean
  link?: boolean
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

export function GoogleSignIn({ disabled, link = false, begin, release, success }: Props) {
  const target = useRef<HTMLDivElement>(null)
  const [config, setConfig] = useState<GoogleConfig>()
  const [stage, setStage] = useState<GoogleStage | 'config'>('config')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [retrySeconds, setRetrySeconds] = useState(0)

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
          // this login view.
          const meta = document.querySelector<HTMLMetaElement>('meta[name="referrer"]')
          if (meta) {
            const previous = meta.content
            meta.content = window.location.protocol === 'http:' && window.location.hostname === 'localhost' ? 'no-referrer-when-downgrade' : 'strict-origin-when-cross-origin'
            restoreReferrer = () => { meta.content = previous }
          }
          attempt = googleIdentityAttempt(selected.clientId!, target.current, { stage: setStage, begin, release, success, error: onError }, link)
        } else setStage('ready')
      } catch (reason) { onError(reason) }
    })
    const focus = () => attempt?.checkExpiry()
    window.addEventListener('focus', focus)
    return () => { active = false; abort.abort(); attempt?.dispose(); restoreReferrer?.(); window.removeEventListener('focus', focus) }
  }, [revision, begin, release, success, link])

  useEffect(() => {
    if (!retrySeconds) return
    const timer = setTimeout(() => setRetrySeconds(Math.ceil(googleRetryDelay() / 1000)), 1000)
    return () => clearTimeout(timer)
  }, [retrySeconds])

  function retry() {
    setError(''); setStage('config'); setConfig(undefined); setRevision(value => value + 1)
  }
  const gis = config?.enabled && config.mode === 'GisIdToken'
  const canRetry = !!error || stage === 'expired' || stage === 'waiting'
  return <div className="auth-google-section">
    {/* Google owns the button contents and branding. Inert blocks interaction during verification requests. */}
    <div ref={target} className="auth-google-sdk" inert={disabled || !gis || !!error || stage === 'expired'} hidden={!gis || !!error || stage === 'expired'} />
    {error ? <p className="inline-error" role="alert">{error}</p> : config && !config.enabled ? <p className="auth-google-status" role="status">ورود با گوگل فعلاً در دسترس نیست. می‌توانید با شماره موبایل وارد شوید.</p> :
      <p className="auth-google-status" role="status" aria-live="polite">{messages[stage]}</p>}
    {canRetry && <button type="button" className="button button-ghost button-block" disabled={retrySeconds > 0 || (disabled && stage !== 'waiting')} onClick={retry}>
      {retrySeconds ? `تلاش دوباره پس از ${retrySeconds} ثانیه` : stage === 'waiting' ? 'لغو و تلاش دوباره' : 'تلاش دوباره برای ورود با گوگل'}
    </button>}
  </div>
}
