import { useCallback, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'

// eslint-disable-next-line react-refresh/only-export-components
export function useRemote<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision(x => x + 1), [])
  useEffect(() => {
    let active = true
    setBusy(true); setError('')
    fetcher().then(d => { if (active) setData(d) }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'ارتباط برقرار نشد.') }).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [fetcher, revision])
  return { data, error, busy, reload, setData }
}
export function LoadState({ busy, error, retry }: { busy: boolean; error: string; retry: () => void }) {
  if (error) return <div className="cent-error" role="alert"><p>{error}</p><button className="button button-secondary" onClick={retry}><RotateCcw size={16}/> تلاش دوباره</button></div>
  if (busy) return <div className="cent-loading" role="status"><span className="cent-spinner"/> در حال بارگذاری…</div>
  return null
}
