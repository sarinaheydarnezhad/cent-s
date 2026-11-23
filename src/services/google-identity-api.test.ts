import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const clientId = 'test.apps.googleusercontent.com'
const challenge = { challengeId: 'C'.repeat(42) + 'A', nonce: 'N'.repeat(42) + 'A', browserBinding: 'B'.repeat(42) + 'A', expiresAt: '2026-11-16T16:05:00Z' }
const auth = { token: 'A'.repeat(64), expiresAt: '2026-11-23T16:00:00Z', user: { id: 'user', name: 'Learner', email: 'learner@example.test', role: 'STUDENT' } }
let fetchMock: ReturnType<typeof vi.fn>
function response(data: unknown, status = 200, headers = {}) {
  fetchMock.mockResolvedValueOnce(new Response(data === undefined ? null : JSON.stringify(data), { status, headers }))
}

beforeEach(() => { vi.resetModules(); fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock) })
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers() })

describe('documented Google identity transport', () => {
  it('sends the Cent bearer only to authenticated linking, never public GIS sign-in', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('sessionStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) })
    const { session } = await import('./cent')
    session.set('C'.repeat(64), new Date(Date.now() + 60_000).toISOString())
    response(auth); response(auth)
    const { verifyGoogleCredential } = await import('./google-identity-api')
    await verifyGoogleCredential(challenge, 'synthetic')
    await verifyGoogleCredential(challenge, 'synthetic', undefined, true)
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
    expect(fetchMock.mock.calls[1][0]).toBe('/api/cent/v1/auth/identities/google/gis/complete')
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer ' + 'C'.repeat(64))
    expect(fetchMock.mock.calls[1][1].credentials).toBe('omit')
  })
  it.each(['SuperAdmin', 'UserManager', 'ContentManager', 'ExamManager', 'FinanceManager'])('accepts the existing Cent role %s', async role => {
    response({ ...auth, user: { ...auth.user, role } })
    const { verifyGoogleCredential } = await import('./google-identity-api')
    expect((await verifyGoogleCredential(challenge, 'synthetic')).user.role).toBe(role)
  })
  it.each(['GisIdToken'])('discovers %s without cookies, auth headers, body, preflight header or caching', async mode => {
    response({ enabled: true, mode, clientId })
    const { discoverGoogle } = await import('./google-identity-api')
    expect(await discoverGoogle()).toEqual({ enabled: true, mode, clientId })
    expect(fetchMock.mock.calls[0]).toEqual(['/api/cent/v1/auth/google/config', expect.objectContaining({ method: 'GET', credentials: 'omit', cache: 'no-store' })])
    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined()
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined()
  })
  it('accepts disabled configuration without guessing a flow', async () => {
    response({ enabled: false, mode: 'GisIdToken', clientId: null })
    const { discoverGoogle } = await import('./google-identity-api')
    expect((await discoverGoogle()).enabled).toBe(false)
  })
  it.each([null, {}, { enabled: true, mode: 'gis', clientId }, { enabled: true, mode: 'GisIdToken', clientId: '' }])('fails closed on malformed discovery %j', async data => {
    response(data)
    const { discoverGoogle } = await import('./google-identity-api')
    await expect(discoverGoogle()).rejects.toThrow('پاسخ سرویس')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('posts the empty challenge with the exact JSON/header contract and leaves Origin to the browser', async () => {
    response(challenge)
    const { createGoogleChallenge } = await import('./google-identity-api')
    const started = performance.now()
    const result = await createGoogleChallenge()
    expect(result.challenge).toEqual(challenge)
    expect(result.deadline - started).toBeLessThanOrEqual(295_010)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/cent/v1/auth/google/gis/challenge')
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST', body: '{}', cache: 'no-store', credentials: 'omit', headers: { 'Content-Type': 'application/json', 'X-Cent-GIS': '1' } })
  })
  it('uses the server lifetime despite a workstation clock several minutes ahead', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-16T16:07:00Z'))
    response(challenge, 200, { Date: 'Mon, 16 Nov 2026 16:00:00 GMT' })
    const { createGoogleChallenge } = await import('./google-identity-api')
    expect((await createGoogleChallenge()).deadline).toBeGreaterThan(performance.now() + 294_000)
  })
  it('rejects an already expired server challenge', async () => {
    response(challenge, 200, { Date: 'Mon, 16 Nov 2026 16:05:00 GMT' })
    const { createGoogleChallenge } = await import('./google-identity-api')
    await expect(createGoogleChallenge()).rejects.toThrow('مهلت')
  })
  it.each([{ nonce: 'short' }, { browserBinding: 'x'.repeat(43) }, { challengeId: 12 }, { expiresAt: 'invalid' }])('rejects malformed challenge %j', async override => {
    response({ ...challenge, ...override })
    const { createGoogleChallenge } = await import('./google-identity-api')
    await expect(createGoogleChallenge()).rejects.toThrow('پاسخ سرویس')
  })
  it('sends only documented completion fields, returns the Cent session, and never persists/logs a Google credential', async () => {
    const log = vi.spyOn(console, 'log'), error = vi.spyOn(console, 'error')
    const storage = { setItem: vi.fn() }
    vi.stubGlobal('localStorage', storage); vi.stubGlobal('sessionStorage', storage)
    response(auth)
    const { verifyGoogleCredential } = await import('./google-identity-api')
    expect(await verifyGoogleCredential(challenge, 'synthetic-google-credential')).toEqual(auth)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/cent/v1/auth/google/gis/complete')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ challengeId: challenge.challengeId, browserBinding: challenge.browserBinding, idToken: 'synthetic-google-credential' })
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json', 'X-Cent-GIS': '1' })
    expect(storage.setItem).not.toHaveBeenCalled(); expect(log).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled()
  })
  it.each(['', ' ', 'x'.repeat(10_001), '\\'.repeat(10_000)])('rejects blank/oversized tokens and oversized serialized JSON', async idToken => {
    const { verifyGoogleCredential } = await import('./google-identity-api')
    await expect(verifyGoogleCredential(challenge, idToken)).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it.each([400, 401, 403, 404, 409, 413, 415, 429, 503])('never automatically retries completion after HTTP %s', async status => {
    response({ code: status === 409 ? 'google_account_conflict' : undefined, message: 'RAW TECHNICAL FAILURE' }, status)
    const { verifyGoogleCredential, googleIdentityError } = await import('./google-identity-api')
    await verifyGoogleCredential(challenge, 'synthetic').catch(error => expect(googleIdentityError(error)).not.toContain('RAW TECHNICAL'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it.each([[429, undefined, 60_000], [503, undefined, 60_000], [503, 'google_unavailable', 5000], [503, 'temporarily_unavailable', 5000]])('applies backoff to %s/%s without JSON or Retry-After assumptions', async (status, code, delay) => {
    response(code ? { code } : undefined, status)
    const { discoverGoogle, googleRetryDelay } = await import('./google-identity-api')
    await expect(discoverGoogle()).rejects.toMatchObject({ retryAfterMs: delay })
    expect(googleRetryDelay()).toBeGreaterThan(delay - 500)
    await expect(discoverGoogle()).rejects.toMatchObject({ status: 429 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('honors Retry-After, including HTTP dates relative to the server Date', async () => {
    response({}, 429, { 'Retry-After': 'Mon, 16 Nov 2026 16:02:00 GMT', Date: 'Mon, 16 Nov 2026 16:00:00 GMT' })
    const { discoverGoogle } = await import('./google-identity-api')
    await expect(discoverGoogle()).rejects.toMatchObject({ retryAfterMs: 120_000 })
  })
  it('handles network/CORS failures and malformed success JSON with safe Persian messages', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('SECRET TECHNICAL ERROR'))
    fetchMock.mockResolvedValueOnce(new Response('<html>proxy</html>'))
    const { discoverGoogle, googleIdentityError } = await import('./google-identity-api')
    for (let i = 0; i < 2; i++) await discoverGoogle().catch(error => expect(googleIdentityError(error)).not.toMatch(/SECRET|Unexpected|html/))
  })
  it('uses the production API base without the local app prefix', async () => {
    vi.stubEnv('VITE_CENT_API_URL', 'https://lerona-app.com/api/cent/v1/')
    response({ enabled: true, mode: 'GisIdToken', clientId })
    const { discoverGoogle } = await import('./google-identity-api')
    await discoverGoogle()
    expect(fetchMock.mock.calls[0][0]).toBe('https://lerona-app.com/api/cent/v1/auth/google/config')
    vi.unstubAllEnvs()
  })
  it.each([null, { ...auth, token: 'not-a-cent-session' }, { ...auth, user: { ...auth.user, role: 'OTHER' } }])('rejects malformed backend authentication without accepting Google claims: %j', async data => {
    response(data)
    const { verifyGoogleCredential } = await import('./google-identity-api')
    await expect(verifyGoogleCredential(challenge, 'synthetic')).rejects.toThrow('پاسخ سرویس')
  })
})
