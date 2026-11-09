import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = 's'.repeat(43), codeVerifier = 'v'.repeat(43)
const attemptKey = 'cent:google-attempt:v1'
const expiresAt = new Date(Date.now() + 300_000).toISOString()
const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?state=${state}&code_challenge=backend-proof&code_challenge_method=S256`
const start = { authorizationUrl, state, codeVerifier, expiresAt }
const auth = { token: 'cent-token', expiresAt: new Date(Date.now() + 604_800_000).toISOString(), user: { id: 'user-id', name: 'Learner', email: 'learner@example.test', role: 'STUDENT' } }
let storage: Map<string, string>
let fetchMock: ReturnType<typeof vi.fn>
let location: { pathname: string; search: string; assign: ReturnType<typeof vi.fn> }
let history: { state: unknown; replaceState: ReturnType<typeof vi.fn> }

function savedAttempt(overrides = {}) {
  storage.set(attemptKey, JSON.stringify({ state, codeVerifier, expiresAt, returnTo: '/student/notes?page=2', ...overrides }))
}
function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
}

beforeEach(() => {
  vi.resetModules()
  storage = new Map()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
  })
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  location = { pathname: '/cent-s/auth/google/callback', search: `?state=${state}&code=google-code`, assign: vi.fn() }
  history = { state: { preserved: true }, replaceState: vi.fn(() => { location.search = '' }) }
  vi.stubGlobal('window', { location, history })
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('Google authorization with backend-generated PKCE', () => {
  it('uses the existing API URL, stores only the tab attempt, then redirects to the unmodified URL', async () => {
    respond(start)
    const { startGoogleSignIn } = await import('./google-auth')
    location.assign.mockImplementation(() => {
      expect(JSON.parse(storage.get(attemptKey)!)).toEqual({ state, codeVerifier, expiresAt, returnTo: '/student/notes' })
    })
    await startGoogleSignIn('/student/notes')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/cent/v1/auth/google/start')
    expect(init).toMatchObject({ method: 'POST', body: '{}', credentials: 'omit', cache: 'no-store' })
    expect(init.headers.get('Content-Type')).toBe('application/json')
    expect(location.assign).toHaveBeenCalledWith(authorizationUrl)
  })

  it('replaces the previous attempt and excludes unsafe return destinations', async () => {
    savedAttempt()
    respond(start)
    const { startGoogleSignIn } = await import('./google-auth')
    await startGoogleSignIn('https://untrusted.example/')
    expect(JSON.parse(storage.get(attemptKey)!)).toEqual({ state, codeVerifier, expiresAt })
  })

  it('does not redirect when session storage cannot save the verifier', async () => {
    respond(start)
    sessionStorage.setItem = () => { throw new DOMException('Storage blocked', 'QuotaExceededError') }
    const { startGoogleSignIn, googleAuthError } = await import('./google-auth')
    await expect(startGoogleSignIn()).rejects.toThrow('Storage blocked')
    expect(location.assign).not.toHaveBeenCalled()
    expect(googleAuthError(new DOMException('', 'QuotaExceededError'))).toContain('ذخیره‌سازی')
  })

  it.each([
    { authorizationUrl: 'https://untrusted.example/' },
    { authorizationUrl: 'javascript:alert(1)' },
    { authorizationUrl: 'https://accounts.google.com@untrusted.example/' },
    { state: '' }, { codeVerifier: 'short' }, { expiresAt: 'not-a-date' }, { expiresAt: '2000-01-01T00:00:00Z' },
  ])('rejects an unusable start response: %j', async override => {
    respond({ ...start, ...override })
    const { startGoogleSignIn } = await import('./google-auth')
    await expect(startGoogleSignIn()).rejects.toThrow()
    expect(location.assign).not.toHaveBeenCalled()
    expect(storage.has(attemptKey)).toBe(false)
  })

  it('surfaces service/network errors without creating an attempt', async () => {
    respond({ message: 'Unavailable', code: 'google_unavailable' }, 503)
    const { startGoogleSignIn, googleAuthError } = await import('./google-auth')
    await startGoogleSignIn().catch(error => expect(googleAuthError(error)).toContain('در دسترس نیست'))
    expect(storage.has(attemptKey)).toBe(false)
    expect(location.assign).not.toHaveBeenCalled()
    expect(googleAuthError(new TypeError('Failed to fetch'))).toContain('اتصال اینترنت')
  })

  it('respects Retry-After on rate-limited starts without automatically retrying', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Wait' }), { status: 429, headers: { 'Retry-After': '120' } }))
    const { startGoogleSignIn, googleAuthError } = await import('./google-auth')
    await startGoogleSignIn().catch(error => expect(googleAuthError(error)).toContain('120'))
    await expect(startGoogleSignIn()).rejects.toMatchObject({ status: 429 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(storage.has(attemptKey)).toBe(false)
  })
})

describe('Google callback validation and one-time completion', () => {
  it('cleans the callback before requesting completion, submits the exact proof, and returns the Cent session', async () => {
    savedAttempt()
    respond(auth)
    const { captureGoogleCallback, completeGoogleSignIn } = await import('./google-auth')
    captureGoogleCallback()
    expect(history.replaceState).toHaveBeenCalledWith({ preserved: true }, '', location.pathname)
    expect(location.search).toBe('')
    expect(storage.has(attemptKey)).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
    await expect(completeGoogleSignIn()).resolves.toEqual({ ...auth, returnTo: '/student/notes?page=2' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/cent/v1/auth/google/complete')
    expect(JSON.parse(init.body)).toEqual({ state, codeVerifier, code: 'google-code' })
    expect(init.credentials).toBe('omit')
  })

  it('shares exactly one request for simultaneous effects and subsequent remounts', async () => {
    savedAttempt()
    let resolve!: (response: Response) => void
    fetchMock.mockReturnValue(new Promise<Response>(r => { resolve = r }))
    const { completeGoogleSignIn } = await import('./google-auth')
    const first = completeGoogleSignIn(), duplicate = completeGoogleSignIn()
    expect(duplicate).toBe(first)
    await Promise.resolve()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    resolve(new Response(JSON.stringify(auth), { headers: { 'Content-Type': 'application/json' } }))
    await first
    expect(completeGoogleSignIn()).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('posts cancellation to consume the server attempt and never establishes a session', async () => {
    savedAttempt()
    location.search = `?state=${state}&error=access_denied&error_description=ignored`
    respond({ message: 'Cancelled', code: 'google_cancelled' }, 400)
    const { completeGoogleSignIn, googleAuthError } = await import('./google-auth')
    await completeGoogleSignIn().catch(error => expect(googleAuthError(error)).toContain('لغو شد'))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ state, codeVerifier, error: 'access_denied' })
    expect(storage.has(attemptKey)).toBe(false)
  })

  it.each([
    '', '?code=one', '?state=wrong&code=one',
    `?state=${state}&state=${state}&code=one`,
    `?state=${state}&code=one&code=two`,
    `?state=${state}&code=one&error=access_denied`,
    `?state=${state}&error=one&error=two`,
    `?state=${state}&code=`, `?state=${state}&code=%20`, `?state=${state}&error=`,
    `?state=${state}`, `?state=${state}&code=${'c'.repeat(4097)}`, `?state=${state}&error=${'e'.repeat(257)}`,
  ])('rejects an invalid/ambiguous callback without making a request: %s', async query => {
    savedAttempt()
    location.search = query
    const { completeGoogleSignIn } = await import('./google-auth')
    await expect(completeGoogleSignIn()).rejects.toThrow('معتبر نیست')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(storage.has(attemptKey)).toBe(false)
    expect(location.search).toBe('')
  })

  it.each([
    null, '{broken', 'null', '[]', JSON.stringify({ state }),
    JSON.stringify({ ...start, expiresAt: '2000-01-01T00:00:00Z' }),
    JSON.stringify({ ...start, expiresAt: 'invalid' }),
    JSON.stringify({ ...start, codeVerifier: 'invalid' }),
  ])('rejects a missing, corrupt, or expired local attempt: %s', async raw => {
    if (raw !== null) storage.set(attemptKey, raw)
    // URL-supplied proof can never replace the locally stored verifier.
    location.search += `&codeVerifier=${codeVerifier}`
    const { completeGoogleSignIn } = await import('./google-auth')
    await expect(completeGoogleSignIn()).rejects.toThrow('معتبر نیست')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(location.search).toBe('')
    expect(storage.has(attemptKey)).toBe(false)
  })

  it('ignores a URL-supplied verifier and always uses the saved proof', async () => {
    savedAttempt()
    location.search += '&codeVerifier=attacker-proof'
    respond(auth)
    const { completeGoogleSignIn } = await import('./google-auth')
    await completeGoogleSignIn()
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).codeVerifier).toBe(codeVerifier)
  })

  it.each([
    [400, 'google_authorization_failed', 'انجام نشد'],
    [401, 'invalid_google_credentials', 'معتبر نیست'],
    [409, 'google_account_conflict', 'روش قبلی'],
    [503, 'google_unavailable', 'در دسترس نیست'],
    [503, 'temporarily_unavailable', 'در دسترس نیست'],
    [429, undefined, 'Try later'],
  ])('handles %s/%s without retrying completion', async (status, code, message) => {
    savedAttempt()
    respond({ message: 'Try later', code }, status)
    const { completeGoogleSignIn, googleAuthError } = await import('./google-auth')
    const result = completeGoogleSignIn()
    await result.catch(error => expect(googleAuthError(error)).toContain(message))
    expect(completeGoogleSignIn()).toBe(result)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(storage.has(attemptKey)).toBe(false)
  })

  it('does not replay a callback after a full reload', async () => {
    savedAttempt()
    respond(auth)
    const firstLoad = await import('./google-auth')
    await firstLoad.completeGoogleSignIn()
    vi.resetModules()
    location.search = `?state=${state}&code=google-code`
    const reloaded = await import('./google-auth')
    await expect(reloaded.completeGoogleSignIn()).rejects.toThrow('معتبر نیست')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('return navigation', () => {
  it.each(['//untrusted.example', '/\\untrusted.example', '/login', '/login?from=bad', '/auth/google/callback', '/auth/google/callback?code=bad', '/\n/untrusted', 'https://untrusted.example', undefined])('rejects %s', async value => {
    const { safeReturnTo } = await import('./google-auth')
    expect(safeReturnTo(value)).toBeUndefined()
  })
  it('retains a protected route with its query', async () => {
    const { safeReturnTo } = await import('./google-auth')
    expect(safeReturnTo('/student/study/document?page=2')).toBe('/student/study/document?page=2')
  })
})
