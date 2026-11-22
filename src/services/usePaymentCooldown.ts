import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from './cent'

export function usePaymentCooldown() {
  const [waiting, setWaiting] = useState(false)
  const timer = useRef<number | null>(null)
  const respectRetryAfter = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 429 || !error.retryAfterMs) return
    if (timer.current) window.clearTimeout(timer.current)
    setWaiting(true)
    timer.current = window.setTimeout(() => setWaiting(false), Math.min(2_147_483_647, error.retryAfterMs))
  }, [])
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])
  return { waiting, respectRetryAfter }
}
