import { ApiError, cent, type Library, type PurchaseOrder } from './cent'

export const rial = (value: number) => `${new Intl.NumberFormat('fa-IR').format(value)} ریال`
export const numberFa = (value: number) => new Intl.NumberFormat('fa-IR').format(value)
export function paymentMethod(provider?: string, mode?: string) {
  const actual = provider || ({ DEVELOPMENT_MOCK: 'MOCK', SANDBOX: 'SANDBOX', LIVE: 'ZARINPAL' } as Record<string, string>)[mode || '']
  return actual === 'MOCK' ? 'پرداخت آزمایشی' : actual === 'SANDBOX' ? 'زرین‌پال · محیط آزمایشی' : actual === 'ZARINPAL' ? 'درگاه زرین‌پال' : 'پرداخت فعلاً در دسترس نیست'
}
export type PurchaseIntent = { accountId: string; productId: string; requestId: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const key = (accountId: string, productId: string) => `itatest:checkout:v1:${accountId}:${productId}`
export class PurchaseStorageError extends Error {}

export function recoverableOrder(accountId: string, productId: string, orders: PurchaseOrder[], storage: Pick<Storage, 'getItem'> = localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(key(accountId, productId)) || 'null') as PurchaseIntent | null
    if (saved?.accountId === accountId && saved.productId === productId) {
      const order = orders.find(o => o.productId === productId && o.requestId === saved.requestId)
      if (order) return order
    }
  } catch { /* Saving remains mandatory before checkout. */ }
  return orders.find(o => o.productId === productId && o.status === 'PENDING')
}

// This stores only an account/product retry identity, never payment or access proof.
export function purchaseIntent(accountId: string, productId: string, orders: PurchaseOrder[], storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): PurchaseIntent {
  let stored: string | null
  try { stored = storage.getItem(key(accountId, productId)) } catch { throw new PurchaseStorageError() }
  let parsed: PurchaseIntent | null = null
  try { parsed = stored ? JSON.parse(stored) : null } catch { /* Replace an invalid local identity before making any request. */ }
  const pending = orders.find(order => order.productId === productId && order.status === 'PENDING' && order.requestId && uuid.test(order.requestId))
  const valid = parsed?.accountId === accountId && parsed.productId === productId && uuid.test(parsed.requestId)
  const intent = { accountId, productId, requestId: pending?.requestId || (valid ? parsed!.requestId : crypto.randomUUID()) }
  try { storage.setItem(key(accountId, productId), JSON.stringify(intent)) } catch { throw new PurchaseStorageError() }
  return intent
}
export function rememberIntent(accountId: string, order: PurchaseOrder, storage: Pick<Storage, 'setItem'> = localStorage) {
  if (!order.productId || !order.requestId || !uuid.test(order.requestId)) throw new Error('اطلاعات ادامه این پرداخت در دسترس نیست؛ وضعیت سفارش رو دوباره بررسی کن.')
  try { storage.setItem(key(accountId, order.productId), JSON.stringify({ accountId, productId: order.productId, requestId: order.requestId })) } catch { throw new PurchaseStorageError() }
}
export function clearPaidIntent(accountId: string, order: PurchaseOrder, storage: Pick<Storage, 'getItem' | 'removeItem'> = localStorage) {
  if (order.status !== 'PAID' || !order.productId || !order.requestId) return
  try {
    const stored = JSON.parse(storage.getItem(key(accountId, order.productId)) || 'null') as PurchaseIntent | null
    if (stored?.requestId === order.requestId && stored.accountId === accountId) storage.removeItem(key(accountId, order.productId))
  } catch { /* A trusted order remains paid even when browser storage is unavailable. */ }
}
export function ownsTraining(library: Library | null, trainingId?: string | null) {
  return !!trainingId && !!library?.entitlements.some(e => e.kind === 'TRAINING' && e.trainingId === trainingId && !e.revokedAt && e.expiresAt === null)
}
export function subscriptionIntervals(library: Library, now = Date.now()) {
  return library.entitlements.filter(e => e.kind === 'SUBSCRIPTION' && !e.revokedAt && e.expiresAt)
    .map(e => ({ ...e, state: Date.parse(e.startsAt) > now ? 'upcoming' : Date.parse(e.expiresAt!) <= now ? 'expired' : 'current' }))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}
export function paymentFeedback(error: unknown): string {
  if (error instanceof PurchaseStorageError) return 'مرورگر اجازه نگه‌داشتن درخواست خرید رو نمی‌ده. تنظیمات ذخیره‌سازی رو بررسی کن؛ هنوز درخواست پرداختی ارسال نشده.'
  if (!(error instanceof ApiError)) return 'نتونستیم وضعیت پرداخت رو دریافت کنیم. سفارش ممکنه ثبت شده باشه؛ با همون درخواست دوباره بررسی کن.'
  if (error.status === 401) return 'برای ادامه بررسی پرداخت، دوباره وارد حسابت شو. درخواست قبلی حفظ شده.'
  if (error.status === 429) return 'درخواست‌ها زیاد شده؛ بعد از زمان انتظار دوباره وضعیت رو بررسی کن.'
  switch (error.code) {
    case 'already_owned': return 'این آموزش رو قبلاً خریده‌ای. دسترسی فعلی رو از کتابخانه بررسی کن.'
    case 'payments_not_configured': return 'پرداخت فعلاً در دسترس نیست. بعداً از همین سفارش ادامه بده.'
    case 'gateway_rejected': return 'درخواست اتصال به درگاه پذیرفته نشد. می‌تونی همین درخواست رو دوباره ادامه بدی.'
    case 'gateway_invalid_response': return 'پاسخ قابل تأییدی از درگاه نرسید. وضعیت سفارش رو بررسی کن؛ پرداخت تازه‌ای شروع نکن.'
    case 'mock_payment_disabled':
    case 'invalid_payment_provider': return 'ادامه این پرداخت فعلاً در دسترس نیست و به بررسی پشتیبانی نیاز داره. سفارش قبلی رو نگه دار.'
    case 'temporarily_unavailable': return 'ارتباط بررسی پرداخت موقتاً برقرار نشد. وضعیت سفارش رو دوباره بررسی کن؛ درخواست قبلی حفظ شده.'
    case 'access_required': return 'دسترسی فعلی رو از کتابخانه بررسی کن؛ تأیید پرداخت با مجوز مطالعه تفاوت داره.'
    default: return error.status === 404 ? 'این محصول یا سفارش در دسترس نیست. فهرست منابع و سوابق خریدت رو بررسی کن.' : 'ادامه این درخواست ممکن نشد. اول وضعیت سفارش رو بررسی کن و شناسه درخواست قبلی رو تغییر نده.'
  }
}
export async function checkPayment(id: string, api = cent) {
  const before = await api.orders()
  if (!before.some(order => order.id === id)) throw new ApiError('سفارش پیدا نشد.', 404)
  let verificationError: unknown = null
  try { await api.verify(id) } catch (error) { verificationError = error }
  const [orders, access] = await Promise.all([api.orders(), api.library().then(data => ({ data, error: null as unknown })).catch(error => ({ data: null, error }))])
  const order = orders.find(item => item.id === id)
  if (!order) throw new ApiError('سفارش پیدا نشد.', 404)
  return { order, library: access.data, accessError: access.error, verificationError }
}
