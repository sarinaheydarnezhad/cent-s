import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AccessLabel, OrderHistory, ProductCard, SubscriptionSummary } from './CommerceUI'
import type { Library, StoreProduct } from '../services/cent'

const library: Library = { trainings: [], documents: [], progress: [], notes: [], entitlements: [], readableTrainingIds: [], hasSubscription: false }
const product: StoreProduct = { id: 'product', kind: 'TRAINING', title: 'ریاضی', trainingId: 'training', active: true, priceRial: 250001, durationDays: null }
const render = (node: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>)
describe('commerce presentation semantics', () => {
  it('uses a decorative title cover without protected thumbnails or invented metadata', () => {
    const html = render(<ProductCard product={product} library={library}/>)
    expect(html).toContain('aria-hidden="true"'); expect(html).toContain('۲۵۰٬۰۰۱ ریال'); expect(html).not.toContain('<img'); expect(html).not.toContain('تومان')
  })
  it('prioritizes current library access over purchase for owned resources', () => {
    const html = render(<ProductCard product={product} library={{ ...library, readableTrainingIds: ['training'], entitlements: [{ id: 'grant', kind: 'TRAINING', trainingId: 'training', startsAt: '2026-01-01', expiresAt: null, revokedAt: null }] }}/>)
    expect(html).toContain('در کتابخانه من'); expect(html).not.toContain('/checkout?product=')
  })
  it('allows an explicit permanent purchase alongside temporary subscription access', () => {
    const html = render(<ProductCard product={product} library={{ ...library, hasSubscription: true, readableTrainingIds: ['training'] }}/>)
    expect(html).toContain('مطالعه با دسترسی فعلی'); expect(html).toContain('خرید دسترسی دائمی'); expect(html).not.toContain('خرید تکی · دائمی')
  })
  it('does not mistake revoked or historical grants for current read permission', () => {
    expect(render(<AccessLabel library={library} trainingId="training"/>)).toBe('')
  })
  it('uses server subscription status even when queued coverage exists', () => {
    const html = render(<SubscriptionSummary library={{ ...library, entitlements: [{ id: 'future', kind: 'SUBSCRIPTION', trainingId: null, startsAt: '2090-01-01', expiresAt: '2090-02-01', revokedAt: null }] }}/>)
    expect(html).toContain('اشتراک فعال نداری'); expect(html).toContain('دوره بعدی'); expect(html).not.toContain('اشتراکت فعاله')
  })
  it('shows a real discovery action for an empty order history', () => {
    const html = render(<OrderHistory orders={[]} library={library}/>); expect(html).toContain('هنوز خریدی ثبت نکرده‌ای'); expect(html).toContain('href="/package"')
  })
  it('keeps a referenced pending order unconfirmed and recoverable', () => {
    const html = render(<OrderHistory library={library} orders={[{ id: 'order', title: 'منبع', kind: 'TRAINING', status: 'PENDING', reference: '123', amountRial: 250001, createdAt: '2026-11-19', provider: 'SANDBOX' }]}/> )
    expect(html).toContain('پرداخت تأیید نشده'); expect(html).toContain('/checkout/success?order=order'); expect(html).not.toContain('ناموفق')
  })
  it('retains verified payment status without inventing current entitlement', () => {
    const html = render(<OrderHistory library={library} orders={[{ id: 'order', trainingId: 'training', title: 'منبع', kind: 'TRAINING', status: 'PAID', reference: null, amountRial: 1, createdAt: '2026-11-19', provider: 'MOCK' }]}/> )
    expect(html).toContain('پرداخت تأییدشده'); expect(html).not.toContain('دسترسی فعلی به مطالعه')
  })
})
