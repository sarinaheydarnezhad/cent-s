import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AIAnalysis, DiagnosticResult, Order, SessionUser } from '../types'
import { ApiError, cent, session, type Library } from '../services/cent'

interface AppStateValue {
  user: SessionUser | null
  loading: boolean
  sessionError: string
  retrySession: () => void
  diagnosticResult: DiagnosticResult | null
  aiAnalysis: AIAnalysis | null
  orders: Order[]
  library: Library | null
  hasPackage: boolean
  authenticated: (user: SessionUser, token: string) => void
  logout: () => void
  refresh: () => Promise<void>
  setDiagnostic: (result: DiagnosticResult, analysis: AIAnalysis) => void
  addOrder: (order: Order) => void
}
const AppState = createContext<AppStateValue | null>(null)
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [restoreRevision, setRestoreRevision] = useState(0)
  const [diagnosticResult, setResult] = useState<DiagnosticResult | null>(null)
  const [aiAnalysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [library, setLibrary] = useState<Library | null>(null)
  const clear = useCallback(() => { session.clear(); setUser(null); setLibrary(null); setOrders([]); setResult(null); setAnalysis(null); setSessionError('') }, [])
  const refresh = useCallback(async () => {
    const expectedToken = session.get()
    if (!expectedToken) return
    const [nextLibrary, nextOrders, attempts] = await Promise.all([cent.library(), cent.orders(), cent.attempts()])
    if (session.get() !== expectedToken) return
    setLibrary(nextLibrary)
    setOrders(nextOrders.map(o => ({ id: o.id, student: '', product: o.title, amount: o.amountRial / 10,
      status: o.status as Order['status'], provider: o.provider === 'MOCK' ? 'MOCK' : 'ZARINPAL', createdAt: o.createdAt, demo: o.provider === 'MOCK' })))
    const latest = attempts[0]
    if (latest) { const data = await cent.outcome(latest.id); if (session.get() === expectedToken) { setResult(data.result); setAnalysis(data.analysis) } }
  }, [])
  useEffect(() => {
    let active = true
    const expectedToken = session.get()
    setSessionError(''); setLoading(true)
    if (expectedToken) cent.me().then(u => { if (active && session.get() === expectedToken) setUser(u) }).catch(e => {
      if (!active || session.get() !== expectedToken) return
      if (e instanceof ApiError && e.status === 401) clear()
      else setSessionError(e instanceof Error ? e.message : 'بررسی حساب ممکن نشد؛ دوباره تلاش کنید.')
    }).finally(() => { if (active) setLoading(false) })
    else setLoading(false)
    window.addEventListener('cent:session-expired', clear)
    return () => { active = false; window.removeEventListener('cent:session-expired', clear) }
  }, [clear, restoreRevision])
  useEffect(() => { if (user) void refresh().catch(() => {}) }, [user, refresh])
  const value = useMemo<AppStateValue>(() => ({ user, loading, sessionError, retrySession: () => setRestoreRevision(r => r + 1), diagnosticResult, aiAnalysis, orders, library,
    hasPackage: library?.hasSubscription ?? false,
    authenticated: (u, token) => { setLibrary(null); setOrders([]); setResult(null); setAnalysis(null); setSessionError(''); session.set(token); setUser(u); setLoading(false) },
    logout: () => { void cent.logout().catch(() => {}); clear() }, refresh,
    setDiagnostic: (result, analysis) => { setResult(result); setAnalysis(analysis) },
    addOrder: () => { void refresh() },
  }), [user, loading, sessionError, diagnosticResult, aiAnalysis, orders, library, refresh, clear])
  return <AppState.Provider value={value}>{children}</AppState.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  const value = useContext(AppState)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
