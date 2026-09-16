import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { mainProduct } from '../../data/content'
import { api } from '../../services/api'
import { useAppState } from '../../state/AppState'

export function CheckoutPage() {
  const { user, addOrder, hasPackage } = useAppState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout' }} />
  if (hasPackage) return <Navigate to="/student/content" replace />

  async function pay() {
    setLoading(true); setError('')
    try {
      const order = await api.mockPayment(mainProduct, user!)
      addOrder(order)
      navigate('/checkout/success', { state: { order } })
    } catch (err) { setError(err instanceof Error ? err.message : 'پرداخت آزمایشی ناموفق بود.'); setLoading(false) }
  }

  return <div className="container checkout-page"><div className="checkout-main"><Link className="back-link" to="/package">بازگشت به پکیج</Link><h1>تکمیل خرید آزمایشی</h1><div className="demo-alert"><ShieldAlert/><div><b>درگاه دمو / MOCK</b><p>هیچ مبلغی از حساب شما کسر نمی‌شود و اطلاعات بانکی دریافت نمی‌کنیم.</p></div></div><section className="card checkout-form"><h2>اطلاعات دریافت‌کننده</h2><div className="readonly-fields"><label>نام و نام خانوادگی<input value={user.name} readOnly/></label><label>ایمیل<input value={user.email} readOnly dir="ltr"/></label></div><h2>روش پرداخت</h2><div className="mock-method selected"><CreditCard/><div><b>پرداخت آزمایشی Cent-s</b><span>MockPaymentProvider</span></div><CheckCircle2/></div>{error && <div className="inline-error"><AlertCircle/>{error}</div>}<button className="button button-primary button-large button-block" onClick={pay} disabled={loading}><LockKeyhole/> {loading ? 'در حال ساخت سفارش…' : 'تأیید پرداخت آزمایشی'}</button></section></div><aside className="card order-summary"><h2>خلاصه سفارش</h2><div><span>{mainProduct.title}</span><b>{mainProduct.price.toLocaleString('fa-IR')} تومان</b></div><hr/><div className="order-total"><span>مبلغ قابل پرداخت</span><strong>{mainProduct.price.toLocaleString('fa-IR')} تومان</strong></div><small>در نسخه دمو این مبلغ واقعاً دریافت نمی‌شود.</small></aside></div>
}

export function CheckoutSuccessPage() {
  return <div className="container success-page"><div className="success-check"><CheckCircle2/></div><span className="demo-badge dark">پرداخت MOCK</span><h1>پکیج با موفقیت برای حساب دمو فعال شد.</h1><p>یک سفارش آزمایشی با وضعیت PAID ثبت شد. این پیام تأیید تراکنش واقعی نیست.</p><div className="success-actions"><Link className="button button-primary button-large" to="/student/content">ورود به پکیج <ArrowLeft/></Link><Link className="button button-secondary button-large" to="/student">داشبورد دانشجو</Link></div></div>
}
