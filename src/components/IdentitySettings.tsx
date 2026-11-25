import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, Mail, Smartphone } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { ApiError, type AuthSession } from '../services/cent'
import { InputField } from './Fields'
import { GoogleSignIn } from './GoogleSignIn'
import { SmsSignIn } from './SmsSignIn'
import { Button, Notice } from './UI'

export function IdentitySettings() {
  const { user, authenticated, updateName } = useAppState()
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [method, setMethod] = useState<'phone' | 'google'>()
  const [linked, setLinked] = useState(false)
  const [nameStatus, setNameStatus] = useState<{ error: boolean; message: string }>()
  const begin = useCallback(() => {
    if (lock.current) return false
    lock.current = true
    setBusy(true)
    return true
  }, [])
  const release = useCallback(() => { lock.current = false; setBusy(false) }, [])
  const success = useCallback((session: AuthSession) => {
    authenticated(session.user, session.token, session.expiresAt)
    setMethod(undefined)
    setLinked(true)
  }, [authenticated])
  if (!user) return null

  const { phone } = user
  const email = user.googleEmail === undefined ? user.email : user.googleEmail
  const hasGoogle = user.hasGoogle ?? Boolean(email)
  const mobileDescription = phone === null ? 'شماره‌ای متصل نشده است.' : 'شماره موبایل در اطلاعات حساب نمایش داده نمی‌شود.'

  function toggleMethod(option: 'phone' | 'google') {
    setLinked(false)
    setMethod(method === option ? undefined : option)
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim()
    if (!name) {
      setNameStatus({ error: true, message: 'نام خود را وارد کنید.' })
      return
    }
    if (!begin()) return
    setNameStatus(undefined)
    try {
      await updateName(name)
      setNameStatus({ error: false, message: 'نام شما ذخیره شد.' })
    } catch (error) {
      setNameStatus({ error: true, message: error instanceof ApiError ? error.message : 'ذخیره نام ممکن نشد. دوباره تلاش کنید.' })
    } finally {
      release()
    }
  }

  return <div className="account-settings">
    <section className="card account-settings-card" aria-labelledby="personal-details-title">
      <div className="account-settings-heading">
        <span className="account-name-avatar" aria-hidden="true">{user.name.slice(0, 1)}</span>
        <div><p id="personal-details-title">اطلاعات شخصی</p><h2>{user.name}</h2></div>
      </div>
      <form className="cent-form" onSubmit={saveName}>
        <InputField key={user.name} label="نام و نام خانوادگی" name="name" defaultValue={user.name} autoComplete="name" maxLength={120} required disabled={busy}/>
        <Button type="submit" disabled={busy}>ذخیره نام</Button>
        {nameStatus && <Notice tone={nameStatus.error ? 'error' : 'success'} live={nameStatus.error ? 'assertive' : 'polite'}>{nameStatus.message}</Notice>}
      </form>
    </section>
    <section className="card account-settings-card" aria-labelledby="login-methods-title">
      <header><h2 id="login-methods-title">روش‌های ورود</h2><p>روش‌های متصل به حساب خود را مدیریت کنید.</p></header>
      {linked && <Notice tone="success" live="polite">روش ورود به حساب شما اضافه شد.</Notice>}
      <div className="account-method">
        <Smartphone aria-hidden="true"/>
        <div>
          <h3>شماره موبایل</h3>
          {phone ? <bdi dir="ltr">{phone}</bdi> : <p>{mobileDescription}</p>}
        </div>
        {phone && <span className="account-method-status"><Check size={16} aria-hidden="true"/>متصل</span>}
        {phone === null &&
          <Button variant="secondary" disabled={busy} aria-expanded={method === 'phone'} onClick={() => toggleMethod('phone')}>{method === 'phone' ? 'بستن' : 'افزودن شماره'}</Button>}
      </div>
      {phone && user.hasPassword === false && <Link className="text-link" to="/login" state={{ recovery: true, from: '/student/profile' }}>تنظیم رمز عبور برای ورود با موبایل</Link>}
      {phone === null && method === 'phone' && <SmsSignIn mode="link" disabled={busy} begin={begin} release={release} success={success}/>}
      <div className="account-method">
        <Mail aria-hidden="true"/>
        <div>
          <h3>حساب گوگل</h3>
          {hasGoogle ? email && <bdi dir="ltr">{email}</bdi> : <p>حساب گوگل متصل نشده است.</p>}
        </div>
        {hasGoogle ? <span className="account-method-status"><Check size={16} aria-hidden="true"/>متصل</span> :
          <Button variant="secondary" disabled={busy} aria-expanded={method === 'google'} onClick={() => toggleMethod('google')}>{method === 'google' ? 'بستن' : 'افزودن گوگل'}</Button>}
      </div>
      {!hasGoogle && method === 'google' && <GoogleSignIn link disabled={busy} begin={begin} release={release} success={success}/>}
    </section>
  </div>
}
