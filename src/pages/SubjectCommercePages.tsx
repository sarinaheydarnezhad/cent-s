import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { cent, dateFa, session } from '../services/cent'
import { subjectsApi, subjectState, toman, type ContentCounts, type SubjectQuote } from '../services/subjects'
import { useRemote } from '../components/CentUI'
import { Badge, Button, Card, Notice, PageHeader, Skeleton } from '../components/UI'
import { CommerceHero, CommerceLoading, OnlineAccessNotice } from '../components/CommerceUI'
import { usePaymentCooldown } from '../services/usePaymentCooldown'
import { CentCheckoutPage } from './CommercePages'

function useNow() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const tick = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(tick) }, [])
  return now
}

export function CheckoutPage() {
  const [params] = useSearchParams()
  return params.has('product') ? <CentCheckoutPage/> : <SubjectCheckoutPage/>
}

function Counts({ value }: { value: ContentCounts }) {
  return <span>{value.chapters} فصل · {value.topics} مبحث · {value.lessons} درس · {value.exercises} تمرین · {value.questions} سؤال</span>
}
export function SubjectCatalogPage() {
  const now = useNow()
  const { user } = useAppState()
  const remote = useRemote(subjectsApi.catalog)
  const status = useRemote(cent.status)
  const fetchAccess = useCallback(() => user ? subjectsApi.access() : Promise.resolve([]), [user])
  const access = useRemote(fetchAccess)
  const [params] = useSearchParams()
  const [selection, setSelection] = useState<string[]>(() => (params.get('subjects') || '').split(',').filter(Boolean))
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const quote = async () => {
    setBusy(true); setError(''); const token = session.get()
    try { const q = await subjectsApi.quote(selection); if (session.get() === token) navigate('/checkout?quote=' + q.id) }
    catch (e) { setError(e instanceof Error ? e.message : 'دریافت قیمت ممکن نشد؛ دوباره تلاش کن.') }
    finally { setBusy(false) }
  }
  return <div className="container commerce-page"><CommerceHero title="درس‌های CEnT رو انتخاب کن" description="خرید یک‌بارهٔ هر درس با ۱۲ ماه دسترسی؛ برای انتخاب دو تا شش درس، تخفیف پلکانی روی همین خرید اعمال می‌شه."/>
    <CommerceLoading {...remote} retry={remote.reload}/>
    {status.data?.payments === 'DEVELOPMENT_MOCK' && <Notice tone="warning">این محیط برای خرید آزمایشی است؛ هیچ پولی جابه‌جا نمی‌شه و آماده بودن خرید در اینجا به معنی تأیید نهایی علمی یا فروش واقعی نیست.</Notice>}
    <Notice>قیمت هر درس ۴۹۰٬۰۰۰ تومان است. تخفیف خرید هم‌زمان ۱ تا ۶ درس به‌ترتیب ۰، ۵، ۱۰، ۱۵، ۲۰ و ۲۵ درصد است. خریدها تمدید خودکار ندارند.</Notice>
    <div className="commerce-product-grid">{remote.data?.subjects.map(s => {
      const owned = access.data?.filter(a => a.subjectId === s.subjectId && !a.revokedAt && Date.parse(a.expiresAt) > now) || []
      return <Card key={s.subjectId} className="commerce-product" data-subject={s.subjectId}><div className="commerce-product-body"><h2>{s.title}</h2><p lang="en" dir="ltr">{s.englishTitle}</p><p>{s.description}</p>
        <Badge tone={s.available ? 'success' : 'warning'}>{s.available ? 'آمادهٔ خرید' : 'در انتظار بازبینی نهایی'}</Badge>
        <p>منتشرشده: <Counts value={s.published}/></p><p>بازبینی محتوایی اولیه: <Counts value={s.reviewed}/></p><p>بازبینی اولیه به معنی تأیید مستقل علمی یا پوشش کامل آزمون نیست.</p>
        <details><summary>منابع منتشرنشده</summary><Counts value={s.draft}/></details>
        {owned.length > 0 && <p>دسترسی ثبت‌شده تا {dateFa(owned.map(a => a.expiresAt).sort().at(-1)!)}</p>}
        <strong>{toman(s.priceRial)} · ۱۲ ماه</strong>
        <label><input type="checkbox" aria-label={'انتخاب ' + s.title} checked={selection.includes(s.subjectId)} disabled={!s.available || busy} onChange={e => setSelection(old => e.target.checked ? [...old, s.subjectId] : old.filter(id => id !== s.subjectId))}/> {owned.length ? 'افزودن برای تمدید ۱۲ماهه' : 'افزودن به انتخاب‌ها'}</label>
        <Link className="text-link" to={'/courses/' + s.subjectId}>فصل‌ها و درس‌نامه‌ها</Link></div></Card>
    })}</div>
    {!!remote.data?.bundles.length && <section className="card commerce-summary"><h2>بسته‌های پیشنهادی قابل تغییر</h2>{remote.data.bundles.map(b => <div key={b.id}><h3>{b.title}</h3><p>{b.rationale}</p><Button variant="secondary" onClick={() => setSelection(b.subjectIds.filter(id => remote.data!.subjects.some(s => s.subjectId === id && s.available)))}>انتخاب درس‌های آمادهٔ این بسته</Button></div>)}</section>}
    <section className="card commerce-summary"><h2>انتخاب‌های تو: {selection.length} درس</h2><p>قیمت نهایی و تخفیف از سرور دریافت می‌شه. برای تغییر درس‌ها، پیش‌فاکتور تازه دریافت کن.</p>{error && <Notice tone="error">{error}</Notice>}
      {user ? <Button disabled={!selection.length || busy} onClick={quote}>{busy ? 'دریافت قیمت…' : 'دریافت پیش‌فاکتور و ادامهٔ خرید'}</Button> : <Link className="button button-primary" to="/login" state={{ from: '/package?subjects=' + selection.join(',') }}>ورود برای ادامهٔ خرید</Link>}<OnlineAccessNotice/></section>
  </div>
}
export function QuoteSummary({ quote }: { quote: SubjectQuote }) {
  return <><ul className="commerce-intervals">{quote.lines.map(l => <li key={l.subjectId}><strong>{l.title}</strong><span>{toman(l.payableRial)}</span>{l.currentAccessEnd && <span>تمدید پس از پایان دسترسی فعلی: {dateFa(l.currentAccessEnd)}</span>}</li>)}</ul>
    <dl className="commerce-order-facts"><div><dt>جمع قیمت درس‌ها</dt><dd>{toman(quote.subtotalRial)}</dd></div><div><dt>تخفیف {quote.discountPercent}٪</dt><dd>{toman(quote.discountRial)}</dd></div><div><dt>مبلغ پرداخت</dt><dd><strong>{toman(quote.payableRial)}</strong></dd></div></dl></>
}
export function SubjectCheckoutPage() {
  const now = useNow()
  const { user, loading } = useAppState()
  const [params] = useSearchParams(), id = params.get('quote') || '', orderId = params.get('order') || ''
  const fetcher = useCallback(async () => !user ? null : orderId ? subjectsApi.detail(orderId).then(d => d.quote) : id ? subjectsApi.readQuote(id) : null, [user, id, orderId])
  const remote = useRemote(fetcher)
  const [renewal, setRenewal] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const submitting = useRef(false)
  const { waiting, respectRetryAfter } = usePaymentCooldown()
  const navigate = useNavigate()
  if (loading) return <Skeleton/>
  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout?' + params.toString() }}/>
  const quote = remote.data
  const expired = !!quote && Date.parse(quote.expiresAt) <= now
  const needsRenewal = !!quote?.lines.some(l => l.currentAccessEnd && Date.parse(l.currentAccessEnd) > now)
  const pay = async () => {
    if (submitting.current || !quote) return
    submitting.current = true; setBusy(true); setError(''); const token = session.get()
    try {
      const key = `itatest:subject-checkout:${user.id}:${quote.id}`
      let request = localStorage.getItem(key)
      if (!request) { request = crypto.randomUUID(); localStorage.setItem(key, request) }
      const response = orderId ? await subjectsApi.resume(orderId) : await subjectsApi.checkout(quote.id, request, renewal)
      if (session.get() !== token) return
      const url = new URL(response.redirectUrl)
      if (url.origin === location.origin) navigate(url.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/, ''), '') + url.search)
      else location.assign(url.href)
    } catch (e) { respectRetryAfter(e); setError(e instanceof Error ? e.message : 'نتیجهٔ درخواست مشخص نیست؛ همین خرید را دوباره بررسی کن.') }
    finally { submitting.current = false; setBusy(false) }
  }
  return <div className="container commerce-page"><PageHeader title="بررسی خرید" description="پرداخت یک‌باره و دسترسی جداگانهٔ ۱۲ماهه برای هر درس"/><CommerceLoading {...remote} retry={remote.reload}/>
    {quote && <Card className="commerce-summary"><QuoteSummary quote={quote}/><p>دسترسی هر درس از زمان تأیید سرور آغاز می‌شه و ۱۲ ماه تقویمی به وقت UTC اعتبار داره. برای تمدید، دورهٔ جدید پس از پایان دسترسی پیوستهٔ فعلی شروع می‌شه؛ زمان باقی‌مونده از بین نمی‌ره.</p><p>دسترسی شامل منابع منتشرشده و بازبینی‌شدهٔ همان درس است. امکان شروع آزمون کامل جداگانه بررسی می‌شه.</p>
      {needsRenewal && <label><input type="checkbox" checked={renewal} onChange={e => setRenewal(e.target.checked)}/> می‌دونم درس‌های فعال دوباره خریداری می‌شن و یک دورهٔ ۱۲ماهه به پایان دسترسی‌شون اضافه می‌شه.</label>}
      <p>اعتبار پیش‌فاکتور: {dateFa(quote.expiresAt)}</p>{expired && !orderId && <Notice tone="warning">پیش‌فاکتور منقضی شده؛ از فهرست درس‌ها قیمت تازه دریافت کن.</Notice>}{error && <Notice tone="error">{error}</Notice>}
      <Button onClick={pay} disabled={busy || waiting || (expired && !orderId) || (needsRenewal && !renewal)}>{busy ? 'در حال اتصال…' : orderId ? 'ادامهٔ همین سفارش' : 'ثبت سفارش و رفتن به درگاه'}</Button></Card>}
    <Link className="button button-secondary" to="/package">بازگشت به انتخاب درس‌ها</Link><Link className="text-link" to="/student/profile">سوابق خرید</Link></div>
}
export function DevelopmentPaymentPage() {
  const [params] = useSearchParams(), id = params.get('order') || ''
  const { user, loading } = useAppState()
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const navigate = useNavigate()
  const fetcher = useCallback(() => user && id ? subjectsApi.detail(id) : Promise.resolve(null), [user, id])
  const remote = useRemote(fetcher)
  if (loading) return <Skeleton/>
  if (!user) return <Navigate to="/login" state={{ from: '/checkout/development?order=' + id }}/>
  const finish = async (outcome: string) => {
    setBusy(true); setError(''); const token = session.get()
    try { await subjectsApi.developmentPayment(id, outcome); if (session.get() === token) navigate('/checkout/success?order=' + id) }
    catch (e) { setError(e instanceof Error ? e.message : 'بررسی پرداخت ممکن نشد.') }
    finally { setBusy(false) }
  }
  return <div className="container commerce-page"><PageHeader title="درگاه آزمایشی محلی" description="هیچ پولی جابه‌جا نمی‌شه. این مسیر فقط در محیط توسعه فعال است."/><CommerceLoading {...remote} retry={remote.reload}/>
    {remote.data?.order.provider === 'MOCK' && <Card>{remote.data.quote && <QuoteSummary quote={remote.data.quote}/>}<div className="commerce-actions"><Button disabled={busy} onClick={() => finish('success')}>پرداخت موفق آزمایشی</Button><Button variant="secondary" disabled={busy} onClick={() => finish('failed')}>پرداخت ناموفق آزمایشی</Button><Button variant="secondary" disabled={busy} onClick={() => finish('cancelled')}>انصراف از پرداخت</Button></div></Card>}{error && <Notice tone="error">{error}</Notice>}</div>
}
export function SubjectAccessList() {
  const now = useNow()
  const remote = useRemote(subjectsApi.access)
  const catalog = useRemote(subjectsApi.catalog)
  return <section className="commerce-subscription"><h2>دسترسی درس‌های من</h2><CommerceLoading {...remote} retry={remote.reload}/>{!remote.busy && !remote.data?.length && <p>هنوز دسترسی درسی ثبت نشده.</p>}
    <ul className="commerce-intervals">{remote.data?.map(a => <li key={a.id}><strong>{catalog.data?.subjects.find(s => s.subjectId === a.subjectId)?.title || a.subjectId}</strong><Badge>{subjectState(a, now)}</Badge><span>{dateFa(a.startsAt)} تا {dateFa(a.expiresAt)}؛ از زمان پایان، دسترسی این دوره بسته می‌شه.</span></li>)}</ul><Link className="button button-secondary" to="/package">انتخاب درس یا تمدید</Link></section>
}
export function SubjectOrderDetails({ id }: { id: string }) {
  const fetcher = useCallback(() => subjectsApi.detail(id), [id])
  const remote = useRemote(fetcher)
  return <><CommerceLoading {...remote} retry={remote.reload}/>{remote.data?.quote && <QuoteSummary quote={remote.data.quote}/>}<Link className="button button-secondary" to="/student/content">کتابخانهٔ من</Link></>
}
