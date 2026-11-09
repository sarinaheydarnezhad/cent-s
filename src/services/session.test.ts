import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cent, session } from './cent'

let storage: Map<string, string>
beforeEach(() => {
  storage = new Map()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
  })
})
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('Cent bearer session', () => {
  it('retains the existing token key and stores the backend expiration separately', () => {
    const expiresAt = new Date(Date.now() + 1000).toISOString()
    session.set('opaque-token', expiresAt)
    expect(storage.get('cent:session:v1')).toBe('opaque-token')
    expect(session.get()).toBe('opaque-token')
    expect(session.expiresAt()).toBe(expiresAt)
    session.clear()
    expect(storage.size).toBe(0)
  })
  it('accepts existing password sessions without stored expiration', () => {
    storage.set('cent:session:v1', 'existing-token')
    expect(session.get()).toBe('existing-token')
  })
  it('removes an expired session before sending another bearer request', () => {
    vi.useFakeTimers()
    session.set('expired-token', new Date(Date.now() + 1000).toISOString())
    vi.advanceTimersByTime(1000)
    expect(session.get()).toBeNull()
    expect(session.expiresAt()).toBeNull()
  })
  it('rejects expired or malformed returned expirations', () => {
    for (const expiresAt of ['invalid', '2000-01-01T00:00:00Z']) {
      expect(() => session.set('token', expiresAt)).toThrow()
      expect(session.get()).toBeNull()
    }
  })
  it('allows the signed-out UI to render when browser storage is blocked', () => {
    sessionStorage.getItem = () => { throw new DOMException('Storage blocked', 'SecurityError') }
    sessionStorage.removeItem = () => { throw new DOMException('Storage blocked', 'SecurityError') }
    expect(session.get()).toBeNull()
    expect(session.expiresAt()).toBeNull()
    expect(() => session.clear()).not.toThrow()
  })
  it('keeps password login/registration responses and logout on the existing API', async () => {
    const result = { token: 'password-token', expiresAt: new Date(Date.now() + 1000).toISOString(), user: { id: 'id', email: 'test@example.test', name: 'Test', role: 'STUDENT' } }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const input = { email: result.user.email, password: 'unchanged-password', name: result.user.name }
    expect(await cent.authenticate('login', input)).toEqual(result)
    expect(await cent.authenticate('register', input)).toEqual(result)
    session.set(result.token, result.expiresAt)
    await cent.logout()
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual(['/api/cent/v1/auth/login', '/api/cent/v1/auth/register', '/api/cent/v1/auth/logout'])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(input)
    expect(fetchMock.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer password-token')
  })
})
