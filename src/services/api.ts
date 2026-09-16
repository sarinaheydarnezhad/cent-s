import type { AIAnalysis, DiagnosticResult, Order, Product, Question, SessionUser } from '../types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'ارتباط با سرویس با خطا روبه‌رو شد.')
  return payload as T
}

export const api = {
  analyze: (result: DiagnosticResult) => request<AIAnalysis>('/api/ai/analyze', { method: 'POST', body: JSON.stringify(result) }),
  mockPayment: (product: Product, user: SessionUser) => request<Order>('/api/payments/mock', { method: 'POST', body: JSON.stringify({ product, user }) }),
  generateQuestions: (result: DiagnosticResult) => request<Question[]>('/api/questions/generate', { method: 'POST', body: JSON.stringify(result) }),
}
