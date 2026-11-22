import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let scripts: any[]
let append: ReturnType<typeof vi.fn>
beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers(); scripts = []
  append = vi.fn(script => { scripts.push(script) })
  vi.stubGlobal('window', { location: { protocol: 'https:', hostname: 'itatest.ir' } })
  vi.stubGlobal('document', {
    scripts, head: { appendChild: append },
    createElement: () => Object.assign(new EventTarget(), { src: '', remove: vi.fn(() => { scripts.pop() }) }),
  })
})
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

it('shares one official SDK load for simultaneous callers', async () => {
  const { loadGoogleIdentitySdk } = await import('./google-identity-sdk')
  const first = loadGoogleIdentitySdk(), second = loadGoogleIdentitySdk()
  expect(first).toBe(second); expect(append).toHaveBeenCalledTimes(1)
  expect(scripts[0].src).toBe('https://accounts.google.com/gsi/client')
  expect(scripts[0].referrerPolicy).toBe('strict-origin-when-cross-origin')
  const sdk = { initialize: vi.fn(), renderButton: vi.fn(), cancel: vi.fn() }
  window.google = { accounts: { id: sdk } }
  scripts[0].dispatchEvent(new Event('load'))
  expect(await first).toBe(sdk)
  expect(await loadGoogleIdentitySdk()).toBe(sdk)
  expect(append).toHaveBeenCalledTimes(1)
})
it('handles load failure and permits a user-triggered retry without duplicate scripts', async () => {
  const { loadGoogleIdentitySdk } = await import('./google-identity-sdk')
  const failure = expect(loadGoogleIdentitySdk()).rejects.toThrow('بارگذاری')
  scripts[0].dispatchEvent(new Event('error')); await failure
  expect(scripts).toHaveLength(0)
  const retry = expect(loadGoogleIdentitySdk()).rejects.toThrow('بارگذاری')
  scripts[0].dispatchEvent(new Event('error')); await retry
  expect(append).toHaveBeenCalledTimes(2)
})
it('times out instead of leaving sign-in stuck indefinitely', async () => {
  const { loadGoogleIdentitySdk } = await import('./google-identity-sdk')
  const failure = expect(loadGoogleIdentitySdk()).rejects.toThrow('بارگذاری')
  await vi.advanceTimersByTimeAsync(15_000); await failure
})
it('uses the documented HTTP localhost policy and reuses an already present script', async () => {
  window.location.protocol = 'http:'; window.location.hostname = 'localhost'
  const { loadGoogleIdentitySdk } = await import('./google-identity-sdk')
  const first = expect(loadGoogleIdentitySdk()).rejects.toThrow('بارگذاری')
  expect(scripts[0].referrerPolicy).toBe('no-referrer-when-downgrade')
  scripts[0].dispatchEvent(new Event('error')); await first
  const existing = Object.assign(new EventTarget(), { src: 'https://accounts.google.com/gsi/client' })
  scripts.push(existing)
  const pending = loadGoogleIdentitySdk()
  expect(append).toHaveBeenCalledTimes(1)
  const sdk = { initialize: vi.fn(), renderButton: vi.fn(), cancel: vi.fn() }
  window.google = { accounts: { id: sdk } }
  existing.dispatchEvent(new Event('load'))
  expect(await pending).toBe(sdk)
})
