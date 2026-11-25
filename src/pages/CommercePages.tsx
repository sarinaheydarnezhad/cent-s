import { IdentitySettings } from '../components/IdentitySettings'
import { useCallback, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock3, CreditCard } from 'lucide-react'
import { ApiError, cent, session } from '../services/cent'
import { checkPayment, clearPaidIntent, ownsTraining, paymentFeedback, paymentMethod, purchaseIntent, recoverableOrder, rememberIntent } from '../services/commerce'
import { useAppState } from '../state/AppState'
import { useRemote } from '../components/CentUI'
import { Badge, Button, EmptyState, FilterGroup, Notice, PageHeader, Skeleton } from '../components/UI'
import { CommerceHero, CommerceLoading, OnlineAccessNotice, OrderSummary, Price, ProductCard, SubscriptionSummary, OrderHistory } from '../components/CommerceUI'
import { CourseCatalog } from './CourseCatalog'
import { useCommerceAccess } from '../services/useCommerceAccess'
import { usePaymentCooldown } from '../services/usePaymentCooldown'
import { SubjectAccessList, SubjectOrderDetails } from './SubjectCommercePages'

export { LibraryPage, NotesPage } from './ReadingLibrary'

export function CatalogPage() {
  const remote = useRemote(cent.catalog)
  const curriculum = useRemote(cent.curriculum)
  const access = useCommerceAccess()
  const [params, setParams] = useSearchParams()
  const kind = params.get('kind') === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'TRAINING'
  const products = remote.data?.products.filter(p => p.kind === kind && p.active) || []
  return <div className="container commerce-page"><CommerceHero title="منبع مناسب مسیرت رو انتخاب کن" description="یاد بگیر، اونطور که خودت راحتی"/>
    <div className="commerce-section-title"><div><h2>منابع و دسترسی آموزشی</h2><p>خرید تکی برای دسترسی دائمی؛ اشتراک برای مطالعه در مدت اعتبار.</p></div><FilterGroup label="نوع دسترسی آموزشی" value={kind} options={[{ value: 'TRAINING', label: 'آموزش‌های تکی' }, { value: 'SUBSCRIPTION', label: 'اشتراک مطالعه' }]} onChange={value => setParams(value === 'TRAINING' ? {} : { kind: value })}/></div>
    <CommerceLoading {...remote} retry={remote.reload}/>
    {access.user && <CommerceLoading {...access} retry={access.reload}/>}
    {kind === 'SUBSCRIPTION' && <Notice>اشتراک، مالکیت دائمی ایجاد نمی‌کنه. فقط آموزش‌های داخل اشتراک و آزمون‌های شبیه‌ساز در مدت اعتبار در دسترس‌اند. تمدید، یک خرید جداست و خودکار انجام نمی‌شه.</Notice>}
    {!remote.busy && !remote.error && products.length === 0 && <EmptyState title={kind === 'TRAINING' ? 'هنوز منبعی برای خرید منتشر نشده' : 'فعلاً طرح اشتراکی برای خرید موجود نیست'} description="منابع و طرح‌های قابل خرید پس از انتشار اینجا نمایش داده می‌شن."/>}
    {!remote.error && <div className="commerce-product-grid">{products.map(product => {
      const training = remote.data?.trainings.find(t => t.id === product.trainingId)
      const course = curriculum.data?.courses.find(c => c.trainingId === product.trainingId)
      return <ProductCard key={product.id} product={product} description={training?.description} subject={course?.title} library={access.error || access.busy ? null : access.library} detail={course ? `/courses/${course.code}` : undefined}/>
    })}</div>}
    {kind === 'TRAINING' && <section className="commerce-discovery"><h2>درس‌ها و سرفصل‌های منتشرشده</h2><CourseCatalog actionVariant="secondary" compact excludeTrainingIds={products.flatMap(p => p.trainingId ? [p.trainingId] : [])}/></section>}<OnlineAccessNotice/>
  </div>
}

export function CentCheckoutPage() {
  const location = useLocation()
  return <CheckoutExperience key={location.search}/>
}

function CheckoutExperience() {
  const [params] = useSearchParams()
  const id = params.get('product') || ''
  const orderId = params.get('order')
  const remote = useRemote(cent.catalog)
  const status = useRemote(cent.status)
  const access = useCommerceAccess()
  const { user, loading } = useAppState()
  const ordersFetcher = useCallback(() => user ? cent.orders().then(orders => ({ accountId: user.id, orders })) : Promise.resolve(null), [user])
  const orders = useRemote(ordersFetcher)
  const location = useLocation()
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<unknown>(null)
  const { waiting: cooldown, respectRetryAfter } = usePaymentCooldown()
  const [snapshot, setSnapshot] = useState<number | null>(null)
  if (loading) return <Skeleton/>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>
  const product = remote.data?.products.find(p => p.id === id && p.active)
  const history = orders.data?.accountId === user.id ? orders.data.orders : []
  const existing = orderId ? history.find(o => o.id === orderId && o.productId === id) : recoverableOrder(user.id, id, history)
  const pending = existing?.status === 'PENDING'
  const owned = product?.kind === 'TRAINING' && ownsTraining(access.library, product.trainingId)
  const ready = !remote.busy && !remote.error && !orders.busy && !orders.error && !access.busy && !access.error && !!access.library
  const blocked = failure instanceof ApiError && ['payments_not_configured', 'mock_payment_disabled', 'invalid_payment_provider', 'already_owned', 'invalid_request'].includes(failure.code || '')
  const unavailable = !product && !existing
  async function pay() {
    if (lock.current || !ready || unavailable || owned || cooldown || blocked || !id || (orderId && !existing)) return
    lock.current = true; setBusy(true); setFailure(null)
    const token = session.get()
    try {
      if (existing) rememberIntent(user!.id, existing)
      const intent = purchaseIntent(user!.id, id, existing ? [existing] : history)
      const result = await cent.checkout(id, intent.requestId)
      if (session.get() !== token) return
      if (result.amountRial !== undefined) setSnapshot(result.amountRial)
      window.location.assign(result.redirectUrl)
    } catch (error) {
      if (session.get() !== token) return
      setFailure(error)
      respectRetryAfter(error)
      orders.reload(); access.reload()
    } finally { lock.current = false; setBusy(false) }
  }
  const amount = snapshot ?? existing?.amountRial ?? product?.priceRial
  return <div className="container commerce-page commerce-checkout"><Link className="back-link" to="/package">بازگشت به منابع</Link><PageHeader eyebrow="خرید آموزشی" title={existing ? 'ادامه سفارش قبلی' : 'مرور و پرداخت'} description="جزئیات خریدت رو بررسی کن و بعد ادامه بده."/>
    <CommerceLoading {...remote} retry={remote.reload}/><CommerceLoading {...orders} retry={orders.reload}/><CommerceLoading {...access} retry={access.reload}/>
    {ready && unavailable && <EmptyState kind="unavailable" title="این محصول فعلاً برای خرید موجود نیست" description="منابع قابل خرید رو از فهرست انتخاب کن. برای پرداخت قبلی، سوابق خریدت رو بررسی کن." action={<Link className="button button-secondary" to="/student/profile">سوابق خرید</Link>}/>}
    {ready && orderId && !existing && !unavailable && <Notice tone="warning">این سفارش برای ادامه در دسترس نیست. از سوابق خرید، سفارش خودت رو انتخاب کن.<Link to="/student/profile">سوابق خرید</Link></Notice>}
    {ready && !unavailable && (!orderId || existing) && <div className="commerce-checkout-grid"><section className="card commerce-payment"><div className="commerce-section-title"><CreditCard aria-hidden="true"/><h2>{existing?.title || product?.title}</h2></div>
      <div className="commerce-tags"><Badge>{(existing?.kind || product?.kind) === 'SUBSCRIPTION' ? 'اشتراک با مدت مشخص' : 'خرید تکی · دائمی'}</Badge>{status.data && <Badge>{paymentMethod(existing?.provider, status.data.payments)}</Badge>}</div>
      {(existing?.durationDays || product?.durationDays) && <p>مدت طرح: {existing?.durationDays || product?.durationDays} روز. تمدید خودکار نیست؛ دوره جدید پس از پایان پوشش قبلی شروع می‌شه.</p>}
      {pending && <Notice tone="warning" title="پرداخت این سفارش هنوز تأیید نشده">برای پیشگیری از پرداخت تکراری، ابتدا وضعیت همین سفارش رو بررسی کن.<Link className="button button-secondary" to={`/checkout/success?order=${existing.id}`}>بررسی وضعیت سفارش</Link></Notice>}
      {existing?.status === 'PAID' && <Notice tone="success">پرداخت این سفارش تأیید شده.<Link className="button button-primary" to={`/checkout/success?order=${existing.id}`}>دیدن سفارش و دسترسی فعلی</Link></Notice>}
      {owned && <Notice tone="info">این آموزش رو قبلاً خریده‌ای.<Link className="button button-primary" to="/student/content">رفتن به کتابخانه</Link></Notice>}
      {failure !== null && <Notice tone="warning" live="assertive" title="ادامه پرداخت نیاز به بررسی داره">{paymentFeedback(failure)}<Link className="button button-secondary" to="/student/profile">بررسی سوابق خرید</Link></Notice>}
      <CommerceLoading {...status} retry={status.reload}/>
      {status.data?.payments === 'NOT_CONFIGURED' && <Notice tone="warning">پرداخت فعلاً در دسترس نیست. بعداً از همین صفحه ادامه بده.</Notice>}
      {(existing ? existing.provider === 'MOCK' : status.data?.payments === 'DEVELOPMENT_MOCK') && <Notice>این محیط آزمایشی است؛ پرداخت واقعی انجام نمی‌شه.</Notice>}
      {!owned && existing?.status !== 'PAID' && <Button fullWidth loading={busy} loadingLabel="در حال آماده‌سازی پرداخت…" disabled={cooldown || blocked || !status.data || !!status.error || status.busy || status.data.payments === 'NOT_CONFIGURED'} onClick={pay}>{cooldown ? 'کمی بعد دوباره تلاش کن' : pending ? 'ادامه همین پرداخت' : 'ادامه و پرداخت'}<ArrowLeft size={18}/></Button>}
      <OnlineAccessNotice/>
    </section><aside className="card commerce-summary"><span className="eyebrow">خلاصه سفارش</span><h2>{existing?.title || product?.title}</h2>{amount !== undefined && <Price amount={amount} label="مبلغ قابل پرداخت"/>}<p>{existing ? 'مبلغ ثبت‌شده همین سفارش؛ قیمت امروز روی این سفارش اعمال نمی‌شه.' : 'قیمت فعلی از سرور دریافت شده؛ مبلغ سفارش پس از ثبت، توسط سرور مشخص می‌شه.'}</p>{(existing?.kind || product?.kind) === 'SUBSCRIPTION' && <p>دسترسی به آموزش‌های داخل اشتراک و آزمون‌های شبیه‌ساز در مدت اعتبار؛ مالکیت دائمی ایجاد نمی‌شه.</p>}<Link className="text-link" to="/student/profile">سوابق خرید و وضعیت اشتراک</Link></aside></div>}
  </div>
}

export function CentCheckoutResult() {
  const [params] = useSearchParams()
  const id = params.get('order') || ''
  const { user, loading, refresh } = useAppState()
  const accountId = user?.id
  const { waiting: cooldown, respectRetryAfter } = usePaymentCooldown()
  const fetcher = useCallback(async () => {
    if (!accountId || !id) return null
    const token = session.get()
    const result = await checkPayment(id).catch(error => { respectRetryAfter(error); throw new Error(paymentFeedback(error)) })
    respectRetryAfter(result.verificationError)
    respectRetryAfter(result.accessError)
    if (session.get() !== token) return null
    clearPaidIntent(accountId, result.order)
    return { ...result, accountId }
  }, [accountId, id, respectRetryAfter])
  const remote = useRemote(fetcher)
  const result = remote.data && remote.data.accountId === accountId && remote.data.order.id === id ? remote.data : null
  const failure = result?.verificationError || result?.accessError
  const retry = () => { if (!cooldown) { remote.reload(); void refresh().catch(() => {}) } }
  if (loading) return <Skeleton/>
  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout/success?order=' + id }}/>
  const order = result?.order
  const paid = order?.status === 'PAID'
  const readable = !result?.accessError && !!order?.trainingId && result?.library?.readableTrainingIds.includes(order.trainingId)
  return <div className="container commerce-page commerce-result"><PageHeader eyebrow="پیگیری خرید" title="وضعیت سفارش"/>
    {!id ? <EmptyState kind="unavailable" title="سفارشی برای بررسی مشخص نشده" description="از سوابق خرید، سفارش موردنظرت رو انتخاب کن." action={<Link className="button button-primary" to="/student/profile">سوابق خرید</Link>}/> : <>
      <CommerceLoading busy={remote.busy} error={remote.error ? 'بررسی سفارش ممکن نشد' : ''} retry={retry} retryDisabled={cooldown}/>
      {!remote.busy && !remote.error && order && <section className="card commerce-result-card"><div className={`commerce-result-symbol ${paid ? 'is-paid' : ''}`} aria-hidden="true">{paid ? <CheckCircle2/> : <Clock3/>}</div><Badge tone={paid ? 'success' : 'warning'}>{paid ? 'پرداخت تأییدشده' : 'پرداخت تأیید نشده'}</Badge><h2>{paid ? 'پرداختت تأیید شد' : 'هنوز تأیید پرداخت نرسیده'}</h2><p>{paid ? 'وضعیت پرداخت از سرور دریافت شده. دسترسی مطالعه جداگانه بر اساس مجوز فعلی حساب بررسی می‌شه.' : 'این وضعیت به معنی ناموفق بودن قطعی پرداخت نیست. اگر پرداخت رو انجام داده‌ای، ابتدا همین سفارش رو دوباره بررسی کن.'}</p><h3>{order.title}</h3><Price amount={order.amountRial} label="مبلغ ثبت‌شده سفارش"/><details><summary>جزئیات سفارش</summary><OrderSummary order={order}/></details>
        {order.kind === 'SUBJECT_ORDER' && <><SubjectOrderDetails id={order.id}/>{order.status === 'PENDING' && <Link className="button button-secondary" to={'/checkout?order=' + order.id}>ادامهٔ همین سفارش</Link>}{['FAILED', 'CANCELLED'].includes(order.status) && <Notice tone="warning">{order.status === 'FAILED' ? 'پرداخت ناموفق بود.' : 'از پرداخت انصراف داده شده.'} برای خرید تازه به فهرست درس‌ها برگرد. اگر مبلغی کسر شده، همین سفارش را دوباره بررسی کن.</Notice>}</>}
        {!!failure && <Notice tone="warning" title="بررسی کامل نشد">{paymentFeedback(failure)}</Notice>}
        {paid && !result?.accessError && order.kind === 'TRAINING' && !readable && <Notice>پرداخت تأیید شده، اما این آموزش الان برای مطالعه در دسترس نیست. وضعیت فعلی رو از کتابخانه بررسی کن.</Notice>}
        {paid && result?.library && order.kind === 'SUBSCRIPTION' && <SubscriptionSummary library={result.library}/>}
        <div className="commerce-actions">{readable && <Link className="button button-primary" to="/student/content">مطالعه از کتابخانه<ArrowLeft size={18}/></Link>}<Button variant={readable ? 'secondary' : 'primary'} disabled={cooldown} onClick={retry}>بررسی دوباره</Button><Link className="button button-secondary" to="/student/profile">سوابق خرید</Link></div>
        {!paid && order.kind !== 'SUBJECT_ORDER' && order.productId && order.requestId && <details className="commerce-recovery"><summary>پرداخت نیمه‌کاره رو چطور ادامه بدم؟</summary><p>اگر هنوز پرداخت نکرده‌ای، ادامه از همین سفارش، شناسه درخواست قبلی رو نگه می‌داره. اگر مبلغی کسر شده، اول بررسی دوباره رو انجام بده.</p><Link className="button button-secondary" to={`/checkout?product=${order.productId}&order=${order.id}`}>ادامه همین سفارش</Link></details>}
      </section>}
    </>}
  </div>
}

export function AccountPage() {
  const access = useCommerceAccess()
  const remote = useRemote(cent.orders)
  return <div className="commerce-account">
    <PageHeader title="حساب کاربری من" action={<Link className="button button-secondary" to="/student/content">کتابخانهٔ من</Link>}/>
    <IdentitySettings/>
    <SubjectAccessList/>
    <CommerceLoading {...access} retry={access.reload}/>
    {access.library?.entitlements.some(e => e.kind === 'SUBSCRIPTION') && <SubscriptionSummary library={access.library}/>}
    <div className="commerce-section-title"><h2>سوابق خرید</h2><CreditCard aria-hidden="true"/></div>
    <CommerceLoading {...remote} retry={remote.reload}/>
    {remote.data && !remote.busy && !remote.error && <OrderHistory orders={remote.data} library={access.error || access.busy ? null : access.library}/>}
  </div>
}
