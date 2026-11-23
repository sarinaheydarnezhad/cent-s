import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, type AuthSession } from '../services/cent'
import { latinDigits, normalizeIranPhone, requestSms, verifySms, type SmsChallenge } from '../services/sms-auth'
import { Button, Notice } from './UI'
import { InputField } from './Fields'

interface Props { disabled: boolean; begin: () => boolean; release: () => void; success: (session: AuthSession) => void; link?: boolean }
// No OTP or challenge proof is persisted. A refresh safely returns to number entry.
export function SmsSignIn({ disabled, begin, release, success, link = false }: Props) {
  const [phone, setPhone] = useState('')
  const [challenge, setChallenge] = useState<SmsChallenge>()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deadline, setDeadline] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline - performance.now()) / 1000)))
    tick(); const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [deadline])
  useEffect(() => { if (challenge) input.current?.focus() }, [challenge])
  async function submit(event?: FormEvent, resend = false) {
    event?.preventDefault()
    const normalized = normalizeIranPhone(phone)
    if (!normalized) { setError('شماره موبایل معتبر ایران وارد کنید.'); return }
    if (resend && seconds > 0) return
    if (challenge && !resend && !/^[0-9]{6}$/.test(code)) { setError('کد شش‌رقمی را وارد کنید.'); return }
    if (!begin()) return
    setBusy(true); setError('')
    try {
      if (!challenge || resend) {
        const result = await requestSms(normalized, link)
        if (mounted.current) {
          setChallenge(result); setCode('')
          setDeadline(performance.now() + Math.max(0, Date.parse(result.resendAt) - Date.parse(result.serverTime)))
        }
      } else {
        const session = await verifySms(challenge.challengeId, code, link)
        if (mounted.current) { setChallenge(undefined); setCode(''); success(session) }
      }
    } catch (reason) {
      if (mounted.current) {
        setError(reason instanceof ApiError ? reason.message : 'ارتباط برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.')
        if (reason instanceof ApiError && reason.status === 429) setDeadline(performance.now() + (reason.retryAfterMs || 60_000))
      }
    } finally { if (mounted.current) setBusy(false); release() }
  }
  return <form className="cent-form" onSubmit={submit} aria-busy={busy}>
    {!challenge ? <InputField label="شماره موبایل" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="09123456789" value={phone} maxLength={14} disabled={disabled} onChange={event => setPhone(latinDigits(event.target.value))} required/> : <>
      <p>کد ورود به <bdi dir="ltr">{challenge.phone}</bdi> ارسال شد. کد دو دقیقه اعتبار دارد.</p>
      <label className="ui-field">کد تأیید
        <input key={challenge.challengeId} ref={input} className="ui-input" type="text" inputMode="numeric" autoComplete="one-time-code" dir="ltr" value={code} maxLength={6} pattern="[0-9]{6}" disabled={disabled} onChange={event => setCode(latinDigits(event.target.value).replace(/[^0-9]/g, '').slice(0, 6))} required/>
      </label>
    </>}
    {error && <Notice tone="error" live="assertive">{error}</Notice>}
    <Button type="submit" fullWidth disabled={disabled || (!challenge && seconds > 0)} loading={busy} loadingLabel="در حال بررسی…">{challenge ? link ? 'تأیید و اتصال شماره' : 'تأیید و ورود' : 'ارسال کد تأیید'}</Button>
    {seconds > 0 && <p role="status">ارسال دوباره پس از {seconds} ثانیه</p>}
    {challenge && <div className="auth-sms-actions">
      <button className="button button-ghost" type="button" disabled={disabled || seconds > 0} onClick={() => void submit(undefined, true)}>ارسال دوباره کد</button>
      <button className="button button-ghost" type="button" disabled={disabled} onClick={() => { setChallenge(undefined); setCode(''); setError('') }}>تغییر شماره</button>
    </div>}
  </form>
}
