import { ApiError, centApiBase, type AuthSession } from './cent'

export interface GoogleConfig { enabled: boolean; mode: 'AuthorizationCode' | 'GisIdToken'; clientId: string | null }
export interface GoogleChallenge { challengeId: string; nonce: string; browserBinding: string; expiresAt: string }
export class GoogleIdentityError extends Error {}
const unavailable = 'ورود با گوگل فعلاً در دسترس نیست. کمی بعد دوباره تلاش کنید.'
const invalidResponse = 'پاسخ سرویس ورود معتبر نیست. کمی بعد دوباره تلاش کنید.'
let retryAt = 0

export function googleRetryDelay(): number { return Math.max(0, retryAt - performance.now()) }

// Deliberately separate from the bearer client: no Authorization, cookies, caching or automatic retries.
async function request(path: string, signal?: AbortSignal, body?: string): Promise<Response> {
  const wait = googleRetryDelay()
  if (wait > 0) throw new ApiError(unavailable, 429, undefined, wait)
  let response: Response
  try {
    response = await fetch(centApiBase + path, {
      method: body === undefined ? 'GET' : 'POST',
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json', 'X-Cent-GIS': '1' }, body }),
      cache: 'no-store', credentials: 'omit', redirect: 'error',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
    })
  } catch {
    throw new GoogleIdentityError('ارتباط با سرویس ورود برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.')
  }
  if (response.ok) return response
  const payload = await response.json().catch(() => null)
  const code = typeof payload?.code === 'string' ? payload.code : undefined
  const header = response.headers.get('Retry-After')
  const serverDate = Date.parse(response.headers.get('Date') || '')
  const retry = header === null ? NaN : /^\d+$/.test(header) ? Number(header) * 1000 : Date.parse(header) - (Number.isFinite(serverDate) ? serverDate : Date.now())
  const fallback = response.status === 429 || (response.status === 503 && !code) ? 60_000 : 5000
  const delay = [429, 503].includes(response.status) ? Math.max(1000, Number.isFinite(retry) ? retry : fallback) : undefined
  if (delay) retryAt = performance.now() + delay
  throw new ApiError(unavailable, response.status, code, delay)
}

async function json(response: Response): Promise<any> {
  try { return await response.json() } catch { throw new GoogleIdentityError(invalidResponse) }
}

export async function discoverGoogle(signal?: AbortSignal): Promise<GoogleConfig> {
  const data = await json(await request('/auth/google/config', signal))
  if (!data || typeof data.enabled !== 'boolean' || !['AuthorizationCode', 'GisIdToken'].includes(data.mode) ||
      (data.enabled ? typeof data.clientId !== 'string' || !data.clientId.trim() : data.clientId !== null)) {
    throw new GoogleIdentityError(invalidResponse)
  }
  return data
}

export async function createGoogleChallenge(signal?: AbortSignal): Promise<{ challenge: GoogleChallenge; deadline: number }> {
  const started = performance.now()
  const response = await request('/auth/google/gis/challenge', signal, '{}')
  const challenge = await json(response)
  // Canonical unpadded base64url for exactly 32 bytes, including the final two zero bits.
  const proof = /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/
  if (!challenge || ![challenge.challengeId, challenge.nonce, challenge.browserBinding].every(v => typeof v === 'string' && proof.test(v)) ||
      typeof challenge.expiresAt !== 'string' || !Number.isFinite(Date.parse(challenge.expiresAt))) {
    throw new GoogleIdentityError(invalidResponse)
  }
  // The contract guarantees a fresh five-minute server lifetime. Start the conservative
  // monotonic deadline BEFORE the request, subtract five seconds, and never trust the
  // workstation clock. If readable, the server Date can only shorten this bound.
  const serverDate = Date.parse(response.headers.get('Date') || '')
  const lifetime = Number.isFinite(serverDate) ? Math.min(300_000, Date.parse(challenge.expiresAt) - serverDate) : 300_000
  const deadline = started + lifetime - 5000
  if (performance.now() >= deadline) throw new GoogleIdentityError('مهلت ورود با گوگل پایان یافته است. دوباره تلاش کنید.')
  return { challenge, deadline }
}

export async function verifyGoogleCredential(challenge: GoogleChallenge, idToken: string, signal?: AbortSignal): Promise<AuthSession> {
  if (typeof idToken !== 'string' || !idToken.trim() || idToken.length > 10_000) throw new GoogleIdentityError('اطلاعات ورود گوگل معتبر نیست. دوباره تلاش کنید.')
  const body = JSON.stringify({ challengeId: challenge.challengeId, browserBinding: challenge.browserBinding, idToken })
  if (new TextEncoder().encode(body).byteLength > 16_384) throw new GoogleIdentityError('اطلاعات ورود گوگل معتبر نیست. دوباره تلاش کنید.')
  const data = await json(await request('/auth/google/gis/complete', signal, body))
  if (!data || typeof data.token !== 'string' || !/^[0-9A-F]{64}$/.test(data.token) ||
      typeof data.expiresAt !== 'string' || !Number.isFinite(Date.parse(data.expiresAt)) ||
      !data.user || typeof data.user.id !== 'string' || !data.user.id || typeof data.user.name !== 'string' ||
      typeof data.user.email !== 'string' || !['STUDENT', 'ADMIN'].includes(data.user.role)) {
    throw new GoogleIdentityError(invalidResponse)
  }
  return data
}

export function googleIdentityError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429 || error.retryAfterMs) return `ورود با گوگل فعلاً ممکن نیست. ${Math.ceil((error.retryAfterMs || 60_000) / 1000)} ثانیه صبر کنید و دوباره تلاش کنید.`
    if (error.code === 'google_account_conflict') return 'این ایمیل قبلاً در Cent ثبت شده است. با روش قبلی خود وارد شوید؛ حساب‌ها خودکار به هم متصل نمی‌شوند.'
    if (error.code === 'invalid_google_credentials') return 'درخواست ورود معتبر نیست یا مهلت آن تمام شده است. دوباره با گوگل وارد شوید.'
    if (error.status === 403 || error.status === 404) return 'سرویس ورود با گوگل آماده نیست. از ورود با ایمیل استفاده کنید یا کمی بعد دوباره تلاش کنید.'
    return unavailable
  }
  return error instanceof GoogleIdentityError ? error.message : unavailable
}
