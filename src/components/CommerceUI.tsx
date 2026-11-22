import { ArrowLeft, BookOpen, CheckCircle2, Clock3, CreditCard, Layers3, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dateFa, type Library, type PurchaseOrder, type StoreProduct } from '../services/cent'
import { numberFa, ownsTraining, rial, subscriptionIntervals } from '../services/commerce'
import { ResourceCover } from './ReadingUI'
import { Badge, Button, EmptyState, Notice, Skeleton } from './UI'
import { toman } from '../services/subjects'

export function CommerceHero({ title, description }: { title: string; description: string }) {
  return <header className="commerce-hero"><div><span className="eyebrow">منابع یادگیری ایتاتست</span><h1>{title}</h1><p>{description}</p></div><div className="commerce-hero-books" aria-hidden="true"><BookOpen/><Layers3/></div></header>
}
export function CommerceLoading({ error, busy, retry, retryDisabled }: { error: string; busy: boolean; retry: () => void; retryDisabled?: boolean }) {
  if (error) return <Notice tone="error" live="assertive" action={<Button variant="secondary" onClick={retry} disabled={retryDisabled}>دوباره تلاش کن</Button>}>نتونستیم اطلاعات رو دریافت کنیم. {error}</Notice>
  return busy ? <Skeleton label="داریم اطلاعات منابع و خرید رو دریافت می‌کنیم…" lines={4}/> : null
}
export function Price({ amount, label = 'مبلغ' }: { amount: number; label?: string }) {
  return <div className="commerce-price"><span>{label}</span><strong>{rial(amount)}</strong></div>
}
export function AccessLabel({ library, trainingId }: { library: Library | null; trainingId?: string | null }) {
  if (ownsTraining(library, trainingId)) return <Badge tone="learning">خرید تکی · دائمی</Badge>
  if (trainingId && library?.readableTrainingIds.includes(trainingId)) return <Badge tone="learning">دسترسی فعلی به مطالعه</Badge>
  return null
}
export function ProductCard({ product, description, subject, library, detail }: { product: StoreProduct; description?: string; subject?: string; library: Library | null; detail?: string }) {
  const owned = ownsTraining(library, product.trainingId)
  const readable = !!product.trainingId && library?.readableTrainingIds.includes(product.trainingId)
  const plan = product.kind === 'SUBSCRIPTION'
  return <article className={`commerce-product card${plan ? ' commerce-plan' : ''}`} data-product={product.id}>
    {plan ? <div className="commerce-plan-top"><Layers3 aria-hidden="true"/><span>{product.durationDays ? `${numberFa(product.durationDays)} روز دسترسی` : 'اشتراک مطالعه'}</span></div> : <ResourceCover title={product.title} subject={subject}/>}
    <div className="commerce-product-body"><div className="commerce-tags"><Badge>{plan ? 'اشتراک مدت‌دار' : 'خرید تکی'}</Badge><AccessLabel library={library} trainingId={product.trainingId}/></div><h2>{product.title}</h2>{description && <p>{description}</p>}
      {plan && <ul className="commerce-benefits"><li><CheckCircle2 aria-hidden="true"/>مطالعه آموزش‌های مشمول اشتراک</li><li><CheckCircle2 aria-hidden="true"/>دسترسی به آزمون‌های شبیه‌ساز در مدت اعتبار</li><li><Clock3 aria-hidden="true"/>تمدید فقط با خرید دوباره؛ بدون تمدید خودکار</li></ul>}
      <Price amount={product.priceRial} label={plan ? 'قیمت این دوره' : 'قیمت خرید تکی'}/>
      <div className="commerce-actions">{owned || readable ? <Link className="button button-primary" to="/student/content">{owned ? 'در کتابخانه من' : 'مطالعه با دسترسی فعلی'}<ArrowLeft size={18}/></Link> : <Link className="button button-primary" to={detail || `/checkout?product=${product.id}`}>{plan ? library?.hasSubscription ? 'خرید دوره بعدی' : 'انتخاب اشتراک' : detail ? 'دیدن منبع و جزئیات' : 'خرید آموزش'}<ArrowLeft size={18}/></Link>}
      {detail && (owned || readable) && <Link className="text-link" to={detail}>جزئیات منبع</Link>}
      {!owned && readable && <Link className="text-link" to={`/checkout?product=${product.id}`}>خرید دسترسی دائمی</Link>}</div>
    </div>
  </article>
}
export function SubscriptionSummary({ library }: { library: Library }) {
  const intervals = subscriptionIntervals(library)
  return <section className="commerce-subscription" aria-label="وضعیت اشتراک"><div className="commerce-section-title"><div><span className="eyebrow">اشتراک مطالعه</span><h2>{library.hasSubscription ? 'اشتراکت فعاله' : intervals.some(e => e.state === 'expired') ? 'اعتبار اشتراک قبلی پایان یافته' : 'اشتراک فعال نداری'}</h2></div><Layers3 aria-hidden="true"/></div>
    <p>اشتراک، دسترسی مدت‌دار به آموزش‌های مشمول و آزمون‌های شبیه‌ساز می‌ده. خریدهای تکی دائمی، جدا از اشتراک باقی می‌مونن.</p>
    {intervals.length > 0 && <ul className="commerce-intervals">{intervals.map(e => <li key={e.id}><Badge tone={e.state === 'current' ? 'learning' : 'neutral'}>{e.state === 'current' ? 'دوره جاری' : e.state === 'upcoming' ? 'دوره بعدی' : 'پایان‌یافته'}</Badge><span>{dateFa(e.startsAt)} تا {dateFa(e.expiresAt!)}</span></li>)}</ul>}
    <Link className="button button-secondary" to="/package?kind=SUBSCRIPTION">{library.hasSubscription ? 'دیدن طرح‌ها و خرید دوره بعدی' : 'دیدن طرح‌های اشتراک'}<ArrowLeft size={18}/></Link>
  </section>
}
export function OrderSummary({ order }: { order: PurchaseOrder }) {
  return <dl className="commerce-order-facts"><div><dt>نوع خرید</dt><dd>{order.kind === 'TRAINING' ? 'آموزش تکی' : order.kind === 'SUBSCRIPTION' ? 'اشتراک مطالعه' : 'خرید آموزشی'}{order.durationDays ? ` · ${numberFa(order.durationDays)} روز` : ''}</dd></div><div><dt>مبلغ سفارش</dt><dd>{rial(order.amountRial)}</dd></div><div><dt>تاریخ سفارش</dt><dd>{dateFa(order.createdAt)}</dd></div><div><dt>روش پرداخت</dt><dd>{order.provider === 'MOCK' ? 'پرداخت آزمایشی' : order.provider === 'SANDBOX' ? 'زرین‌پال · محیط آزمایشی' : order.provider === 'ZARINPAL' ? 'زرین‌پال' : 'اطلاعات روش پرداخت در دسترس نیست'}</dd></div><div><dt>شناسه سفارش</dt><dd><bdi className="commerce-reference">{order.id}</bdi></dd></div>{order.reference && <div><dt>کد پیگیری پرداخت</dt><dd><bdi className="commerce-reference">{order.reference}</bdi></dd></div>}</dl>
}
export function OrderHistory({ orders, library }: { orders: PurchaseOrder[]; library: Library | null }) {
  if (!orders.length) return <EmptyState title="هنوز خریدی ثبت نکرده‌ای" description="سفارش‌ها و وضعیت پرداختت اینجا نمایش داده می‌شن." action={<Link className="button button-secondary" to="/package">دیدن منابع آموزشی</Link>}/>
  return <div className="commerce-order-list">{orders.map(order => <article key={order.id} className="commerce-order card"><div className="commerce-order-heading"><span className="commerce-order-icon" aria-hidden="true"><CreditCard/></span><div><h3>{order.title}</h3><p>{dateFa(order.createdAt)} · {order.kind === 'SUBJECT_ORDER' ? 'خرید درس · ۱۲ ماه' : order.kind === 'TRAINING' ? 'خرید تکی' : 'اشتراک مطالعه'}</p></div><Badge tone={order.status === 'PAID' ? 'success' : 'warning'}>{order.status === 'PAID' ? 'پرداخت تأییدشده' : order.status === 'PENDING' ? 'پرداخت تأیید نشده' : order.status === 'FAILED' ? 'پرداخت ناموفق' : order.status === 'CANCELLED' ? 'انصراف از پرداخت' : 'وضعیت نیازمند بررسی'}</Badge></div><div className="commerce-order-bottom"><strong>{order.kind === 'SUBJECT_ORDER' ? toman(order.amountRial) : rial(order.amountRial)}</strong><AccessLabel library={library} trainingId={order.trainingId}/><Link className="button button-secondary" to={`/checkout/success?order=${order.id}`}>جزئیات و بررسی سفارش<ArrowLeft size={18}/></Link></div><details><summary>اطلاعات سفارش</summary><OrderSummary order={order}/></details></article>)}</div>
}
export function OnlineAccessNotice() {
  return <p className="commerce-access-note"><ShieldCheck size={20} aria-hidden="true"/>مطالعه داخل حساب ایتاتست انجام می‌شه؛ فایل PDF برای دانلود ارائه نمی‌شه.</p>
}
