import type { AuthSession } from './cent'
import { createGoogleChallenge, GoogleIdentityError, verifyGoogleCredential } from './google-identity-api'
import { loadGoogleIdentitySdk, type GoogleCredential, type GoogleIdentitySdk } from './google-identity-sdk'

export type GoogleStage = 'sdk' | 'challenge' | 'ready' | 'waiting' | 'verifying' | 'expired'
interface Callbacks {
  stage: (stage: GoogleStage) => void
  begin: () => boolean
  release: () => void
  success: (session: AuthSession) => void
  error: (error: unknown) => void
}

// One controller per mounted login view. Neither proof nor credential leaves memory
// except for the single documented verification POST. Disposing invalidates callbacks.
export function googleIdentityAttempt(clientId: string, target: HTMLElement, callbacks: Callbacks): { dispose: () => void; checkExpiry: () => void } {
  const abort = new AbortController()
  let active = true, submitted = false, locked = false
  let sdk: GoogleIdentitySdk | undefined
  let attempt: Awaited<ReturnType<typeof createGoogleChallenge>> | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const buttonState = crypto.randomUUID()
  const release = () => { if (locked) { locked = false; callbacks.release() } }
  const discard = () => { attempt = undefined; clearTimeout(timer); sdk?.cancel(); target.replaceChildren() }
  const expired = () => { if (active && !submitted) { discard(); release(); callbacks.stage('expired') } }
  const checkExpiry = () => { if (attempt && performance.now() >= attempt.deadline) expired() }
  const fail = (error: unknown) => { if (active) { discard(); release(); callbacks.error(error) } }

  async function credential(response: GoogleCredential) {
    if (!active || submitted || !attempt || response.state !== buttonState) return
    if (performance.now() >= attempt.deadline) { expired(); return }
    if (!locked) {
      if (!callbacks.begin()) return
      locked = true
    }
    submitted = true
    clearTimeout(timer)
    const challenge = attempt.challenge
    attempt = undefined
    target.replaceChildren()
    callbacks.stage('verifying')
    try {
      const result = await verifyGoogleCredential(challenge, response.credential as string, abort.signal)
      if (active) callbacks.success(result)
    } catch (error) { fail(error) }
    finally { if (active) release() }
  }

  void (async () => {
    try {
      callbacks.stage('sdk')
      sdk = await loadGoogleIdentitySdk()
      if (!active) return
      callbacks.stage('challenge')
      attempt = await createGoogleChallenge(abort.signal)
      if (!active) { attempt = undefined; return }
      sdk.cancel()
      sdk.initialize({
        client_id: clientId, nonce: attempt.challenge.nonce, callback: response => { void credential(response) },
        ux_mode: 'popup', auto_select: false, button_auto_select: false, use_fedcm_for_button: true,
      })
      sdk.renderButton(target, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', locale: 'fa',
        width: Math.min(400, Math.max(200, Math.floor(target.parentElement?.getBoundingClientRect().width || 200))), state: buttonState,
        click_listener: () => {
          if (!active || submitted || !attempt) return
          checkExpiry()
          if (!attempt || locked || !callbacks.begin()) return
          locked = true; callbacks.stage('waiting')
        },
      })
      callbacks.stage('ready')
      timer = setTimeout(expired, Math.max(0, attempt.deadline - performance.now()))
    } catch (error) { fail(error instanceof Error ? error : new GoogleIdentityError('ورود با گوگل انجام نشد. دوباره تلاش کنید.')) }
  })()

  return {
    checkExpiry,
    dispose: () => { active = false; abort.abort(); discard(); release() },
  }
}
