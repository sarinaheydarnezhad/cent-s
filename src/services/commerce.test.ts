import { describe, expect, it, vi } from 'vitest'
import { ApiError, cent, type Library, type PurchaseOrder } from './cent'
import { checkPayment, clearPaidIntent, ownsTraining, paymentFeedback, purchaseIntent, rememberIntent, rial, subscriptionIntervals } from './commerce'

const requestId = '11111111-1111-4111-8111-111111111111'
const order: PurchaseOrder = { id: 'order', productId: 'product', requestId, title: 'منبع', kind: 'TRAINING', amountRial: 250001, status: 'PENDING', provider: 'MOCK', reference: null, createdAt: '2026-11-19T00:00:00Z' }
const library: Library = { trainings: [], documents: [], progress: [], notes: [], entitlements: [], readableTrainingIds: [], hasSubscription: false }
function storage() { const data = new Map<string, string>(); return { getItem: (key: string) => data.get(key) || null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } } }
describe('commerce trust and retry contracts', () => {
  it('keeps the same purchase identity after reload and retries', () => {
    const store = storage(), first = purchaseIntent('a', 'product', [], store)
    expect(purchaseIntent('a', 'product', [], store)).toEqual(first)
    expect(purchaseIntent('b', 'product', [], store).requestId).not.toBe(first.requestId)
    expect(purchaseIntent('a', 'other', [], store).requestId).not.toBe(first.requestId)
  })
  it('recovers the exact server retry identity and persists before sending', () => {
    const store = storage()
    expect(purchaseIntent('a', 'product', [order], store).requestId).toBe(requestId)
    expect(purchaseIntent('a', 'product', [], store).requestId).toBe(requestId)
  })
  it('honors explicit recovery of an older pending order', () => {
    const store = storage(); rememberIntent('a', order, store)
    expect(purchaseIntent('a', 'product', [order], store).requestId).toBe(requestId)
  })
  it('keeps a paid retry identity after a lost response and permits renewal after its result is confirmed', () => {
    const store = storage(); rememberIntent('a', order, store)
    expect(purchaseIntent('a', 'product', [{ ...order, status: 'PAID' }], store).requestId).toBe(requestId)
    clearPaidIntent('a', { ...order, status: 'PAID' }, store)
    expect(purchaseIntent('a', 'product', [{ ...order, status: 'PAID' }], store).requestId).not.toBe(requestId)
  })
  it('never clears an unresolved or different purchase identity', () => {
    const store = storage(); rememberIntent('a', order, store)
    clearPaidIntent('a', order, store)
    expect(purchaseIntent('a', 'product', [], store).requestId).toBe(requestId)
    clearPaidIntent('a', { ...order, requestId: 'other', status: 'PAID' }, store)
    expect(purchaseIntent('a', 'product', [], store).requestId).toBe(requestId)
  })
  it('stops before checkout if the retry identity cannot be saved', () => {
    expect(() => purchaseIntent('a', 'product', [], { getItem: () => null, setItem: () => { throw new Error('blocked') } })).toThrow()
  })
  it('tolerates legacy history without fabricating recovery identifiers', () => {
    expect(() => rememberIntent('a', { ...order, requestId: undefined }, storage())).toThrow()
  })
  it('formats the exact authoritative integer as rials including non-toman amounts', () => {
    expect(rial(250001)).toBe('۲۵۰٬۰۰۱ ریال')
  })
  it('does not treat subscription access as permanent ownership', () => {
    expect(ownsTraining({ ...library, readableTrainingIds: ['training'], hasSubscription: true }, 'training')).toBe(false)
  })
  it('keeps purchase ownership distinct from current readability and revocation', () => {
    const grant = { id: 'grant', kind: 'TRAINING' as const, trainingId: 'training', startsAt: '2026-01-01Z', expiresAt: null, revokedAt: null }
    expect(ownsTraining({ ...library, entitlements: [grant] }, 'training')).toBe(true)
    expect(ownsTraining({ ...library, entitlements: [{ ...grant, revokedAt: '2026-11-01Z' }] }, 'training')).toBe(false)
  })
  it('labels stacked periods separately and excludes revoked periods', () => {
    const grant = { id: 's', kind: 'SUBSCRIPTION' as const, trainingId: null, revokedAt: null, startsAt: '2026-11-01T00:00:00Z', expiresAt: '2026-12-01T00:00:00Z' }
    expect(subscriptionIntervals({ ...library, entitlements: [grant, { ...grant, id: 'future', startsAt: '2026-12-01T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z' }, { ...grant, id: 'revoked', revokedAt: grant.startsAt }] }, Date.parse('2026-11-19T00:00:00Z')).map(e => e.state)).toEqual(['current', 'upcoming'])
  })
  it('checks owner history before verification and does not verify foreign orders', async () => {
    const verify = vi.fn(); await expect(checkPayment('foreign', { ...cent, orders: vi.fn().mockResolvedValue([order]), verify })).rejects.toMatchObject({ status: 404 })
    expect(verify).not.toHaveBeenCalled()
  })
  it('uses refreshed history and current library after verification', async () => {
    const calls: string[] = []; const orders = vi.fn().mockImplementation(async () => { calls.push('orders'); return [{ ...order, status: calls.includes('verify') ? 'PAID' : 'PENDING' }] })
    const result = await checkPayment('order', { ...cent, orders, verify: async () => { calls.push('verify'); return { paid: true } }, library: async () => { calls.push('library'); return library } })
    expect(calls.slice(0, 3)).toEqual(['orders', 'verify', 'orders']); expect(result.order.status).toBe('PAID'); expect(result.library?.readableTrainingIds).toEqual([])
  })
  it('does not accept verify success or navigation as a substitute for order confirmation', async () => {
    const result = await checkPayment('order', { ...cent, orders: async () => [order], verify: async () => ({ paid: true }), library: async () => library })
    expect(result.order.status).toBe('PENDING')
  })
  it('refreshes after an uncertain gateway response while retaining the recoverable order', async () => {
    const error = new ApiError('secret provider body', 502, 'gateway_invalid_response')
    const result = await checkPayment('order', { ...cent, orders: async () => [order], verify: async () => { throw error }, library: async () => library })
    expect(result.verificationError).toBe(error); expect(result.order.status).toBe('PENDING'); expect(paymentFeedback(error)).not.toContain('secret')
  })
  it('never derives access when library refresh fails after trusted payment', async () => {
    const result = await checkPayment('order', { ...cent, orders: async () => [{ ...order, status: 'PAID' }], verify: async () => ({ paid: true }), library: async () => { throw new Error('offline') } })
    expect(result.library).toBeNull(); expect(result.accessError).toBeTruthy()
  })
  it.each(['gateway_invalid_response', 'temporarily_unavailable', 'gateway_rejected', 'invalid_payment_provider', 'payments_not_configured', 'already_owned'])('provides safe actionable feedback for %s', code => {
    const message = paymentFeedback(new ApiError('provider secret', 502, code))
    expect(message).not.toContain('provider secret'); expect(message.length).toBeGreaterThan(20)
  })
})
