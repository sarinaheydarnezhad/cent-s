import { centRequest, type CheckoutResponse, type PurchaseOrder } from './cent'

export interface ContentCounts { chapters: number; topics: number; lessons: number; exercises: number; questions: number }
export interface Subject { subjectId: string; title: string; englishTitle: string; description: string; trainingId: string | null; priceRial: number; available: boolean; status: string; published: ContentCounts; reviewed: ContentCounts; draft: ContentCounts }
export interface SubjectAccess { id: string; subjectId: string; orderId: string; startsAt: string; expiresAt: string; revokedAt: string | null }
export interface SubjectQuote { id: string; subjectIds: string[]; distinctCount: number; subtotalRial: number; discountPercent: number; discountRial: number; payableRial: number; currency: string; pricingVersion: string; termPolicy: string; expiresAt: string; lines: { subjectId: string; title: string; listRial: number; discountRial: number; payableRial: number; currentAccessEnd: string | null }[] }
const post = <T>(path: string, body: unknown) => centRequest<T>(path, { method: 'POST', body: JSON.stringify(body) })
export const toman = (rial: number) => `${new Intl.NumberFormat('fa-IR').format(rial / 10)} تومان`
export const subjectState = (a: SubjectAccess, now = Date.now()) => a.revokedAt ? 'لغوشده' : Date.parse(a.expiresAt) <= now ? 'پایان‌یافته' : Date.parse(a.startsAt) > now ? 'دورهٔ بعدی' : 'فعال'
export const subjectsApi = {
  catalog: () => centRequest<{ subjects: Subject[]; bundles: { id: string; title: string; subjectIds: string[]; rationale: string }[] }>('/catalog'),
  access: () => centRequest<SubjectAccess[]>('/me/subject-access'),
  quote: (subjectIds: string[]) => post<SubjectQuote>('/subject-quotes', { subjectIds }),
  readQuote: (id: string) => centRequest<SubjectQuote>(`/subject-quotes/${id}`),
  checkout: (quoteId: string, requestId: string, acceptRenewal: boolean) => post<CheckoutResponse>('/subject-checkout', { quoteId, requestId, acceptRenewal }),
  resume: (id: string) => post<CheckoutResponse>(`/me/orders/${id}/resume`, {}),
  detail: (id: string) => centRequest<{ order: PurchaseOrder; quote: SubjectQuote | null; access: SubjectAccess[] }>(`/me/orders/${id}`),
  developmentPayment: (id: string, outcome: string) => post<{ redirectUrl: string }>(`/development/payments/${id}`, { outcome }),
}
