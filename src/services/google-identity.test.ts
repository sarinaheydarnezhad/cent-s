import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGoogleChallenge, verifyGoogleCredential } from './google-identity-api'
import { loadGoogleIdentitySdk, type GoogleIdentitySdk } from './google-identity-sdk'
import { googleIdentityAttempt } from './google-identity'

vi.mock('./google-identity-api', async original => ({ ...await original<object>(), createGoogleChallenge: vi.fn(), verifyGoogleCredential: vi.fn() }))
vi.mock('./google-identity-sdk', () => ({ loadGoogleIdentitySdk: vi.fn() }))
const challenge = { challengeId: 'C'.repeat(42) + 'A', nonce: 'N'.repeat(42) + 'A', browserBinding: 'B'.repeat(42) + 'A', expiresAt: '2026-11-16T16:05:00Z' }
const session = { token: 'A'.repeat(64), expiresAt: '2026-11-23T16:00:00Z', user: { id: 'existing-user', name: 'Saved name', email: 'saved@example.test', role: 'STUDENT' as const } }
let sdk: { initialize: ReturnType<typeof vi.fn>; renderButton: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> }
let target: HTMLElement
let callbacks: Parameters<typeof googleIdentityAttempt>[2] & { begin: ReturnType<typeof vi.fn<() => boolean>> }
const controllers: ReturnType<typeof googleIdentityAttempt>[] = []
async function ready() {
  const controller = googleIdentityAttempt('client.apps.googleusercontent.com', target, callbacks)
  controllers.push(controller)
  await vi.advanceTimersByTimeAsync(0)
  return controller
}
function credential() { return sdk.initialize.mock.calls.at(-1)![0].callback }
function button() { return sdk.renderButton.mock.calls.at(-1)![1] }
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks()
  sdk = { initialize: vi.fn(), renderButton: vi.fn(), cancel: vi.fn() }
  vi.mocked(loadGoogleIdentitySdk).mockResolvedValue(sdk as GoogleIdentitySdk)
  vi.mocked(createGoogleChallenge).mockImplementation(async () => ({ challenge: { ...challenge }, deadline: performance.now() + 295_000 }))
  vi.mocked(verifyGoogleCredential).mockResolvedValue(session)
  target = { replaceChildren: vi.fn(), parentElement: { getBoundingClientRect: () => ({ width: 320 }) } } as unknown as HTMLElement
  callbacks = { stage: vi.fn(), begin: vi.fn(() => true), release: vi.fn(), success: vi.fn(), error: vi.fn() }
})
afterEach(() => { controllers.splice(0).forEach(controller => controller.dispose()); vi.useRealTimers() })

describe('GIS attempt lifecycle', () => {
  it('initializes exactly once with the exact client ID/nonce, popup, FedCM and no automatic/One Tap/form sign-in', async () => {
    await ready()
    expect(sdk.initialize).toHaveBeenCalledTimes(1)
    expect(sdk.initialize.mock.calls[0][0]).toEqual({ client_id: 'client.apps.googleusercontent.com', nonce: challenge.nonce, ux_mode: 'popup', auto_select: false, button_auto_select: false, use_fedcm_for_button: true, callback: expect.any(Function) })
    expect(sdk.renderButton).toHaveBeenCalledWith(target, expect.objectContaining({ locale: 'fa', width: 320, state: expect.any(String) }))
    expect(JSON.stringify(sdk.initialize.mock.calls[0][0])).not.toContain(challenge.browserBinding)
  })
  it.each(['existing-user', 'new-user'])('authenticates %s only after backend confirmation and preserves the backend profile', async id => {
    vi.mocked(verifyGoogleCredential).mockResolvedValue({ ...session, user: { ...session.user, id } })
    await ready()
    button().click_listener()
    const completion = credential()({ credential: 'synthetic', state: button().state })
    expect(callbacks.success).not.toHaveBeenCalled()
    await completion
    await vi.advanceTimersByTimeAsync(0)
    expect(verifyGoogleCredential).toHaveBeenCalledWith(challenge, 'synthetic', expect.any(AbortSignal))
    expect(callbacks.success).toHaveBeenCalledWith({ ...session, user: { ...session.user, id } })
    expect(callbacks.release).toHaveBeenCalledTimes(1)
  })
  it('blocks duplicate clicks and callbacks while verification is pending', async () => {
    let resolve!: (value: typeof session) => void
    vi.mocked(verifyGoogleCredential).mockReturnValue(new Promise(r => { resolve = r }))
    await ready()
    button().click_listener(); button().click_listener()
    credential()({ credential: 'synthetic', state: button().state }); credential()({ credential: 'synthetic', state: button().state })
    expect(callbacks.begin).toHaveBeenCalledTimes(1)
    expect(verifyGoogleCredential).toHaveBeenCalledTimes(1)
    resolve(session); await vi.advanceTimersByTimeAsync(0)
    expect(callbacks.success).toHaveBeenCalledTimes(1)
  })
  it('ignores old button state, disposed callbacks and late successful verification', async () => {
    const controller = await ready(), oldCallback = credential(), state = button().state
    oldCallback({ credential: 'synthetic', state: 'old-button' })
    expect(verifyGoogleCredential).not.toHaveBeenCalled()
    let resolve!: (value: typeof session) => void
    vi.mocked(verifyGoogleCredential).mockReturnValue(new Promise(r => { resolve = r }))
    oldCallback({ credential: 'synthetic', state })
    controller.dispose()
    resolve(session); await vi.advanceTimersByTimeAsync(0)
    oldCallback({ credential: 'synthetic', state })
    expect(callbacks.success).not.toHaveBeenCalled()
    expect(verifyGoogleCredential).toHaveBeenCalledTimes(1)
  })
  it('discards an expired challenge and obtains a new nonce on an explicit retry', async () => {
    const first = await ready(), oldCallback = credential(), state = button().state
    await vi.advanceTimersByTimeAsync(295_000)
    expect(callbacks.stage).toHaveBeenLastCalledWith('expired')
    oldCallback({ credential: 'expired', state })
    expect(verifyGoogleCredential).not.toHaveBeenCalled()
    first.dispose(); await ready()
    expect(createGoogleChallenge).toHaveBeenCalledTimes(2)
    expect(button().state).not.toBe(state)
  })
  it('allows explicit dismissal recovery and rejects a cancelled popup credential', async () => {
    const first = await ready(), oldCallback = credential(), state = button().state
    button().click_listener()
    first.dispose()
    expect(callbacks.release).toHaveBeenCalledTimes(1)
    await ready()
    oldCallback({ credential: 'cancelled', state })
    expect(verifyGoogleCredential).not.toHaveBeenCalled()
  })
  it.each(['sdk', 'challenge', 'verification'])('reports %s failure without establishing a session', async failure => {
    if (failure === 'sdk') vi.mocked(loadGoogleIdentitySdk).mockRejectedValueOnce(new Error('sdk'))
    if (failure === 'challenge') vi.mocked(createGoogleChallenge).mockRejectedValueOnce(new Error('challenge'))
    if (failure === 'verification') vi.mocked(verifyGoogleCredential).mockRejectedValueOnce(new Error('verification'))
    await ready()
    if (failure === 'verification') { credential()({ credential: 'synthetic', state: button().state }); await vi.advanceTimersByTimeAsync(0) }
    expect(callbacks.error).toHaveBeenCalledTimes(1)
    expect(callbacks.success).not.toHaveBeenCalled()
  })
  it('does not compete with an in-progress password submission', async () => {
    callbacks.begin.mockReturnValue(false)
    await ready()
    button().click_listener(); credential()({ credential: 'synthetic', state: button().state })
    expect(verifyGoogleCredential).not.toHaveBeenCalled()
  })
})
