import { afterEach, expect, it, vi } from 'vitest'
import { centRequest } from './cent'

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
const path = '/documents/document/source-sections/section'
const throttled = (seconds: number) => new Response(JSON.stringify({ code: 'pilot_throttled' }), { status: 429, headers: { 'Retry-After': String(seconds) } })

it('waits the complete pilot cooldown before retrying a section', async () => {
  vi.useFakeTimers()
  const fetch = vi.fn().mockResolvedValueOnce(throttled(10)).mockResolvedValueOnce(new Response('{"text":"section"}'))
  vi.stubGlobal('fetch', fetch)
  const result = centRequest(path)
  await vi.advanceTimersByTimeAsync(9999)
  expect(fetch).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  await expect(result).resolves.toEqual({ text: 'section' })
  expect(fetch).toHaveBeenCalledTimes(2)
})

it('presents long configured cooldowns without an early automatic retry', async () => {
  const fetch = vi.fn().mockResolvedValue(throttled(300))
  vi.stubGlobal('fetch', fetch)
  await expect(centRequest(path)).rejects.toMatchObject({ status: 429, retryAfterMs: 300000 })
  expect(fetch).toHaveBeenCalledTimes(1)
})

it('honors the complete cooldown for protected diagram hashes from the server', async () => {
  vi.useFakeTimers()
  const fetch = vi.fn().mockResolvedValueOnce(throttled(10)).mockResolvedValueOnce(new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } }))
  vi.stubGlobal('fetch', fetch)
  const result = centRequest<Blob>(path + '/assets/' + 'ABCDEF0123456789'.repeat(4))
  await vi.advanceTimersByTimeAsync(9999)
  expect(fetch).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(await (await result).text()).toEqual('<svg/>')
  expect(fetch).toHaveBeenCalledTimes(2)
})
