import { centRequest, type AuthSession } from './cent'
export function latinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, c => String(c.charCodeAt(0) - (c >= '۰' ? 1776 : 1632)))
}
export function normalizeIranPhone(input: string): string | undefined {
  let phone = latinDigits(input.trim())
  if (/^09[0-9]{9}$/.test(phone)) phone = '+98' + phone.slice(1)
  else if (/^989[0-9]{9}$/.test(phone)) phone = '+' + phone
  return /^\+989[0-9]{9}$/.test(phone) ? phone : undefined
}
export interface SmsChallenge { challengeId: string; phone: string; expiresAt: string; resendAt: string; serverTime: string }
const path = (link: boolean) => link ? '/auth/identities/sms' : '/auth/sms'
export const requestSms = (phone: string, link: boolean) => centRequest<SmsChallenge>(path(link) + '/request', { method: 'POST', body: JSON.stringify({ phone }), signal: AbortSignal.timeout(20_000) })
export const verifySms = (challengeId: string, code: string, link: boolean) => centRequest<AuthSession>(path(link) + '/verify', { method: 'POST', body: JSON.stringify({ challengeId, code }), signal: AbortSignal.timeout(20_000) })
