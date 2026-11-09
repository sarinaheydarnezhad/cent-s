import { ApiError, cent, type AuthSession, type GoogleAuthComplete } from './cent'

const attemptKey = 'cent:google-attempt:v1'
const invalidCallback = 'درخواست ورود با گوگل معتبر نیست یا مهلت آن تمام شده است. دوباره وارد شوید.'
interface GoogleAttempt { state: string; codeVerifier: string; expiresAt: string; returnTo?: string }
interface Callback { input: GoogleAuthComplete; returnTo?: string }
let captured: Callback | Error | undefined
let completion: Promise<AuthSession & { returnTo?: string }> | undefined
let retryAt = 0

async function googleRequest<T>(request: () => Promise<T>): Promise<T> {
  if (Date.now() < retryAt) throw new ApiError('درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.', 429, undefined, retryAt - Date.now())
  try { return await request() }
  catch (error) {
    if (error instanceof ApiError && error.status === 429 && error.retryAfterMs) retryAt = Date.now() + error.retryAfterMs
    throw error
  }
}

// React Router destinations are relative to the app basename, never to another origin.
export function safeReturnTo(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || [...value].some(char => char === '\\' || char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return
  const pathname = value.split(/[?#]/, 1)[0]
  if (value.startsWith('//') || /^\/(?:auth\/google\/callback|login)(?:\/|$)/i.test(pathname)) return
  return value
}

export function googleCallbackPath(): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/auth/google/callback`
}

export async function startGoogleSignIn(returnTo?: string): Promise<void> {
  sessionStorage.removeItem(attemptKey)
  const attempt = await googleRequest(cent.googleStart)
  const url = new URL(attempt.authorizationUrl)
  if (url.origin !== 'https://accounts.google.com' || url.pathname !== '/o/oauth2/v2/auth' || url.username || url.password ||
      !/^[\w-]{43}$/.test(attempt.state) || !/^[\w-]{43}$/.test(attempt.codeVerifier) ||
      !Number.isFinite(Date.parse(attempt.expiresAt)) || Date.parse(attempt.expiresAt) <= Date.now()) {
    throw new Error('شروع ورود با گوگل ممکن نشد. دوباره تلاش کنید.')
  }
  sessionStorage.setItem(attemptKey, JSON.stringify({
    state: attempt.state, codeVerifier: attempt.codeVerifier, expiresAt: attempt.expiresAt, returnTo: safeReturnTo(returnTo),
  } satisfies GoogleAttempt))
  // The backend owns all authorization parameters, including S256 PKCE and redirect_uri.
  window.location.assign(attempt.authorizationUrl)
}

// Called before React mounts. Keep callback secrets in memory and out of subsequent URLs.
export function captureGoogleCallback(): void {
  if (captured !== undefined) return
  const query = new URLSearchParams(window.location.search)
  window.history.replaceState(window.history.state, '', window.location.pathname)
  try {
    const raw = sessionStorage.getItem(attemptKey)
    sessionStorage.removeItem(attemptKey)
    const attempt = raw ? JSON.parse(raw) as GoogleAttempt : null
    const states = query.getAll('state'), codes = query.getAll('code'), errors = query.getAll('error')
    if (!attempt || typeof attempt.state !== 'string' || !/^[\w-]{43}$/.test(attempt.state) ||
        typeof attempt.codeVerifier !== 'string' || !/^[\w-]{43}$/.test(attempt.codeVerifier) ||
        typeof attempt.expiresAt !== 'string' || !Number.isFinite(Date.parse(attempt.expiresAt)) || Date.parse(attempt.expiresAt) <= Date.now() ||
        states.length !== 1 || states[0] !== attempt.state || codes.length + errors.length !== 1 ||
        (codes.length === 1 && (!codes[0].trim() || codes[0].length > 4096)) ||
        (errors.length === 1 && (!errors[0].trim() || errors[0].length > 256))) {
      throw new Error(invalidCallback)
    }
    const proof = { state: states[0], codeVerifier: attempt.codeVerifier }
    captured = { input: codes.length ? { ...proof, code: codes[0] } : { ...proof, error: errors[0] }, returnTo: safeReturnTo(attempt.returnTo) }
  } catch {
    captured = new Error(invalidCallback)
  }
}

export function completeGoogleSignIn(): Promise<AuthSession & { returnTo?: string }> {
  // Share one promise across StrictMode effects and component remounts; never retry a consumed attempt.
  if (!completion) {
    captureGoogleCallback()
    const callback = captured!
    captured = new Error(invalidCallback)
    completion = Promise.resolve().then(async () => {
      if (callback instanceof Error) throw callback
      const result = await googleRequest(() => cent.googleComplete(callback.input))
      if ('error' in callback.input) throw new Error('ورود با گوگل لغو شد. دوباره تلاش کنید.')
      return { ...result, returnTo: callback.returnTo }
    })
  }
  return completion
}

export function googleAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429 && error.retryAfterMs) return `درخواست‌ها زیاد است؛ ${Math.ceil(error.retryAfterMs / 1000)} ثانیه صبر کنید و دوباره تلاش کنید.`
    switch (error.code) {
      case 'google_cancelled': return 'ورود با گوگل لغو شد. می‌توانید دوباره تلاش کنید.'
      case 'google_authorization_failed': return 'ورود با گوگل انجام نشد. دوباره تلاش کنید.'
      case 'invalid_google_credentials': return invalidCallback
      case 'google_account_conflict': return 'این ایمیل قبلاً در Cent ثبت شده است. با روش قبلی خود وارد شوید؛ حساب‌ها خودکار به هم متصل نمی‌شوند.'
      case 'google_unavailable':
      case 'temporarily_unavailable': return 'ورود با گوگل فعلاً در دسترس نیست. کمی بعد دوباره تلاش کنید.'
    }
    return error.message
  }
  if (error instanceof DOMException && ['SecurityError', 'QuotaExceededError'].includes(error.name)) {
    return 'برای ورود با گوگل، دسترسی مرورگر به فضای ذخیره‌سازی این برگه را فعال کنید.'
  }
  if (error instanceof TypeError) return 'ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.'
  return error instanceof Error ? error.message : 'ورود با گوگل انجام نشد. دوباره تلاش کنید.'
}
