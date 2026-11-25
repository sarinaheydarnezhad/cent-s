import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, type AuthSession } from '../services/cent'
import { latinDigits, normalizeIranPhone, requestPasswordReset, requestSms, resetPassword, verifySms, type SmsChallenge } from '../services/sms-auth'
import { Button, Notice } from './UI'
import { InputField } from './Fields'

interface Props {
  disabled: boolean
  begin: () => boolean
  release: () => void
  success: (session: AuthSession) => void
  mode: 'link' | 'register' | 'recovery'
  onPasswordReset?: () => void
}
// No OTP or challenge proof is persisted. A refresh safely returns to number entry.
export function SmsSignIn({ disabled, begin, release, success, mode, onPasswordReset }: Props) {
  const link = mode === 'link'
  const register = mode === 'register'
  const recovery = mode === 'recovery'
  const [phone, setPhone] = useState('')
  const [challenge, setChallenge] = useState<SmsChallenge>()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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
    if (challenge && !resend && register && !name.trim()) { setError('نام خود را وارد کنید.'); return }
    if (!begin()) return
    setBusy(true); setError('')
    try {
      if (!challenge || resend) {
        const result = await (recovery ? requestPasswordReset(normalized) : requestSms(normalized, link))
        if (mounted.current) {
          setChallenge(result); setCode('')
          setDeadline(performance.now() + Math.max(0, Date.parse(result.resendAt) - Date.parse(result.serverTime)))
        }
      } else if (recovery) {
        await resetPassword(challenge.challengeId, code, password)
        if (mounted.current) onPasswordReset?.()
      } else {
        const session = await verifySms(challenge.challengeId, code, link, register ? { password, name: name.trim() } : undefined)
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
      <p>کد تأیید به <bdi dir="ltr">{challenge.phone}</bdi> ارسال شد. کد دو دقیقه اعتبار دارد.</p>
      <label className="ui-field">کد تأیید
        <input key={challenge.challengeId} ref={input} className="ui-input" type="text" inputMode="numeric" autoComplete="one-time-code" dir="ltr" value={code} maxLength={6} pattern="[0-9]{6}" disabled={disabled} onChange={event => setCode(latinDigits(event.target.value).replace(/[^0-9]/g, '').slice(0, 6))} required/>
      </label>
      {register && <InputField label="نام و نام خانوادگی" autoComplete="name" maxLength={120} value={name} disabled={disabled} onChange={event => setName(event.target.value)} required/>}
      {(register || recovery) && <InputField label={recovery ? 'رمز عبور جدید' : 'رمز عبور حساب جدید'} type="password" autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} hint="حداقل ۸ نویسه" value={password} disabled={disabled} onChange={event => setPassword(event.target.value)} required/>}
    </>}
    {error && <Notice tone="error" live="assertive">{error}</Notice>}
    <Button type="submit" fullWidth disabled={disabled || (!challenge && seconds > 0)} loading={busy} loadingLabel="در حال بررسی…">{challenge ? { recovery: 'ذخیره رمز عبور جدید', link: 'تأیید و اتصال شماره', register: 'ساخت حساب و ورود' }[mode] : 'ارسال کد تأیید'}</Button>
    {seconds > 0 && <p role="status">ارسال دوباره پس از {seconds} ثانیه</p>}
    {challenge && <div className="auth-sms-actions">
      <button className="button button-ghost" type="button" disabled={disabled || seconds > 0} onClick={() => void submit(undefined, true)}>ارسال دوباره کد</button>
      <button className="button button-ghost" type="button" disabled={disabled} onClick={() => { setChallenge(undefined); setCode(''); setPassword(''); setError('') }}>تغییر شماره</button>
    </div>}
  </form>
}
