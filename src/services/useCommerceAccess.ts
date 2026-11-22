import { useCallback, useEffect } from 'react'
import { useRemote } from '../components/CentUI'
import { useAppState } from '../state/AppState'
import { cent } from './cent'

export function useCommerceAccess() {
  const { user } = useAppState()
  const accountId = user?.id
  const fetcher = useCallback(() => accountId ? cent.library().then(data => ({ accountId, library: data })) : Promise.resolve(null), [accountId])
  const remote = useRemote(fetcher)
  const library = remote.data?.accountId === accountId ? remote.data?.library || null : null
  const { reload } = remote
  useEffect(() => {
    if (!accountId) return
    const refresh = () => reload()
    window.addEventListener('focus', refresh)
    const upcoming = [...(library?.entitlements || []), ...(library?.subjectAccess || [])].flatMap(e => [Date.parse(e.startsAt), e.expiresAt ? Date.parse(e.expiresAt) : NaN]).filter(time => time > Date.now())
    const next = upcoming.length ? Math.min(...upcoming) : null
    const timer = next ? window.setTimeout(refresh, Math.min(2_147_483_647, Math.max(1, next - Date.now() + 1))) : null
    return () => { window.removeEventListener('focus', refresh); if (timer) window.clearTimeout(timer) }
  }, [accountId, library, reload])
  return { ...remote, library, user }
}
