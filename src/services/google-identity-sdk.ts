import { GoogleIdentityError } from './google-identity-api'

export interface GoogleCredential { credential?: string; state?: string }
export interface GoogleIdentitySdk {
  initialize(options: { client_id: string; nonce: string; callback: (response: GoogleCredential) => void; ux_mode: 'popup'; auto_select: false; button_auto_select: false; use_fedcm_for_button: true }): void
  renderButton(target: HTMLElement, options: { type: 'standard'; theme: 'outline'; size: 'large'; text: 'continue_with'; shape: 'rectangular'; locale: 'fa'; width: number; state: string; click_listener: () => void }): void
  cancel(): void
}
declare global { interface Window { google?: { accounts?: { id?: GoogleIdentitySdk } } } }

const sdkUrl = 'https://accounts.google.com/gsi/client'
let loading: Promise<GoogleIdentitySdk> | undefined

export function loadGoogleIdentitySdk(): Promise<GoogleIdentitySdk> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
  if (loading) return loading
  loading = new Promise<GoogleIdentitySdk>((resolve, reject) => {
    const existing = Array.from(document.scripts).find(script => script.src === sdkUrl)
    const script = existing || document.createElement('script')
    const cleanup = () => { clearTimeout(timer); script.removeEventListener('load', loaded); script.removeEventListener('error', failed) }
    const failed = () => {
      cleanup()
      if (!existing) script.remove()
      reject(new GoogleIdentityError('بارگذاری سرویس گوگل ممکن نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.'))
    }
    const loaded = () => {
      const sdk = window.google?.accounts?.id
      if (!sdk) { failed(); return }
      cleanup(); resolve(sdk)
    }
    const timer = setTimeout(failed, 15_000)
    script.addEventListener('load', loaded, { once: true })
    script.addEventListener('error', failed, { once: true })
    if (!existing) {
      script.src = sdkUrl; script.async = true
      script.referrerPolicy = window.location.protocol === 'http:' && window.location.hostname === 'localhost' ? 'no-referrer-when-downgrade' : 'strict-origin-when-cross-origin'
      document.head.appendChild(script)
    }
  }).catch(error => { loading = undefined; throw error })
  return loading
}
