import { useCallback, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button, LoadingState, Notice } from './UI'

// eslint-disable-next-line react-refresh/only-export-components
export function useRemote<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision(x => x + 1), [])
  useEffect(() => {
    let active = true
    void Promise.resolve().then(async () => {
      if (!active) return
      setBusy(true); setError(''); setData(null)
      try { const data = await fetcher(); if (active) setData(data) }
      catch (e) { if (active) setError(e instanceof Error ? e.message : 'ارتباط برقرار نشد.') }
      finally { if (active) setBusy(false) }
    })
    return () => { active = false }
  }, [fetcher, revision])
  return { data, error, busy, reload, setData }
}
export function LoadState({ busy, error, retry }: { busy: boolean; error: string; retry: () => void }) {
  if (error) return <Notice tone="error" live="assertive" className="cent-error" action={<Button variant="secondary" onClick={retry}><RotateCcw size={16} aria-hidden="true"/> دوباره تلاش کن</Button>}>{error}</Notice>
  if (busy) return <LoadingState/>
  return null
}
