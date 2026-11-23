import { afterEach, describe, expect, it, vi } from 'vitest'
import { latinDigits, normalizeIranPhone, requestSms, verifySms } from './sms-auth'
import { safeReturnTo } from './auth-navigation'

afterEach(() => vi.unstubAllGlobals())
describe('Iranian mobile authentication', () => {
  it.each(['09123456789', '989123456789', '+989123456789', '۰۹۱۲۳۴۵۶۷۸۹', '٠٩١٢٣٤٥٦٧٨٩'])('normalizes %s', value => expect(normalizeIranPhone(value)).toBe('+989123456789'))
  it.each(['', '08123456789', '+12025551234', '091234567890', '0912 3456789'])('rejects %s', value => expect(normalizeIranPhone(value)).toBeUndefined())
  it('accepts pasted Persian OTP digits', () => expect(latinDigits('۱۲٣۴۵۶')).toBe('123456'))
  it('uses Cent request and verify contracts without automatic retry', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce(new Response('{}'))
    vi.stubGlobal('fetch', fetchMock)
    await requestSms('+989123456789', false)
    await verifySms('synthetic-challenge', '123456', false)
    expect(fetchMock.mock.calls.map(c => c[0])).toEqual(['/api/cent/v1/auth/sms/request', '/api/cent/v1/auth/sms/verify'])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ phone: '+989123456789' })
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ challengeId: 'synthetic-challenge', code: '123456' })
  })
  it('uses dedicated identity linking endpoints', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response('{}')))
    vi.stubGlobal('fetch', fetchMock)
    await requestSms('+989123456789', true); await verifySms('synthetic', '123456', true)
    expect(fetchMock.mock.calls.map(c => c[0])).toEqual(['/api/cent/v1/auth/identities/sms/request', '/api/cent/v1/auth/identities/sms/verify'])
  })
})
describe('safe return destinations', () => {
  it.each(['//evil.test', 'https://evil.test', '/\\evil.test', '/login', '/auth/google/callback?code=old', '/student\n'])('rejects %j', value => expect(safeReturnTo(value)).toBeUndefined())
  it('retains local paths and queries', () => expect(safeReturnTo('/checkout?product=1')).toBe('/checkout?product=1'))
})
