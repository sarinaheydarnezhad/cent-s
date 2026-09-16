import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AIAnalysis, DiagnosticResult, Order, SessionUser } from '../types'

interface AppStateValue {
  user: SessionUser | null
  diagnosticResult: DiagnosticResult | null
  aiAnalysis: AIAnalysis | null
  orders: Order[]
  hasPackage: boolean
  login: (role: 'STUDENT' | 'ADMIN') => void
  logout: () => void
  setDiagnostic: (result: DiagnosticResult, analysis: AIAnalysis) => void
  addOrder: (order: Order) => void
}

const AppState = createContext<AppStateValue | null>(null)

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => read('cents:user', null))
  const [diagnosticResult, setResult] = useState<DiagnosticResult | null>(() => read('cents:diagnostic', null))
  const [aiAnalysis, setAnalysis] = useState<AIAnalysis | null>(() => read('cents:analysis', null))
  const [orders, setOrders] = useState<Order[]>(() => read('cents:orders', []))

  useEffect(() => localStorage.setItem('cents:user', JSON.stringify(user)), [user])
  useEffect(() => localStorage.setItem('cents:diagnostic', JSON.stringify(diagnosticResult)), [diagnosticResult])
  useEffect(() => localStorage.setItem('cents:analysis', JSON.stringify(aiAnalysis)), [aiAnalysis])
  useEffect(() => localStorage.setItem('cents:orders', JSON.stringify(orders)), [orders])

  const value = useMemo<AppStateValue>(() => ({
    user,
    diagnosticResult,
    aiAnalysis,
    orders,
    hasPackage: orders.some((order) => order.status === 'PAID'),
    login: (role) => setUser(role === 'ADMIN'
      ? { id: 'admin-demo', name: 'مدیر Cent-s', email: 'admin@cent-s.demo', role }
      : { id: 'student-demo', name: 'سارا احمدی', email: 'student@cent-s.demo', role }),
    logout: () => setUser(null),
    setDiagnostic: (result, analysis) => { setResult(result); setAnalysis(analysis) },
    addOrder: (order) => setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]),
  }), [user, diagnosticResult, aiAnalysis, orders])

  return <AppState.Provider value={value}>{children}</AppState.Provider>
}

// This module intentionally colocates the provider and its hook for the small MVP.
// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  const value = useContext(AppState)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
