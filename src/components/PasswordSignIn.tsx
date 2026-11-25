import { useState, type ComponentProps, type FormEvent } from 'react'
import { ApiError, type AuthSession } from '../services/cent'
import { latinDigits, normalizeIranPhone, signInWithPassword } from '../services/sms-auth'
import { InputField } from './Fields'
import { Button, Notice } from './UI'

export function PasswordSignIn({ disabled, begin, release, success }: {
  disabled: boolean
  begin: () => boolean
  release: () => void
  success: (session: AuthSession) => void
}) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const phone = normalizeIranPhone(String(data.get('phone') ?? ''))
    if (!phone) { setError('شماره موبایل معتبر ایران وارد کنید.'); return }
    if (!begin()) return
    setSubmitting(true)
    setError('')
    try {
      success(await signInWithPassword(phone, String(data.get('password') ?? '')))
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.')
    } finally {
      setSubmitting(false)
      release()
    }
  }

  const normalizeDigits: ComponentProps<'input'>['onChange'] = event => {
    event.currentTarget.value = latinDigits(event.currentTarget.value)
  }
  return <form className="cent-form" onSubmit={submit} aria-busy={submitting}>
    <InputField label="شماره موبایل" name="phone" type="tel" inputMode="tel" dir="ltr" autoComplete="username" maxLength={14} required disabled={disabled} onChange={normalizeDigits}/>
    <InputField label="رمز عبور" name="password" type="password" dir="ltr" autoComplete="current-password" maxLength={128} required disabled={disabled}/>
    {error && <Notice tone="error" live="assertive">{error}</Notice>}
    <Button type="submit" fullWidth disabled={disabled} loading={submitting} loadingLabel="در حال بررسی…">ورود با رمز عبور</Button>
  </form>
}
