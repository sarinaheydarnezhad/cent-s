import type { AIAnalysis, DiagnosticResult, SessionUser } from '../types'

export interface Training { id: string; title: string; description: string; includedInSubscription: boolean; published: boolean }
export interface StoreProduct { id: string; title: string; kind: 'TRAINING' | 'SUBSCRIPTION'; trainingId: string | null; priceRial: number; durationDays: number | null; active: boolean }
export interface StudyDocument { id: string; trainingId: string; sourceId?: string | null; title: string; pageCount: number; sortOrder: number; published?: boolean }
export interface StudyNote { id: string; documentId: string; documentTitle?: string; page: number; anchorY: number; body: string; revision: number; updatedAt: string }
export interface StudyProgress { documentId: string; lastPage: number; furthestPage: number; updatedAt: string }
export interface Entitlement { id: string; kind: 'TRAINING' | 'SUBSCRIPTION'; trainingId: string | null; startsAt: string; expiresAt: string | null; revokedAt: string | null }
export interface Library { trainings: Training[]; documents: StudyDocument[]; notes: { documentId: string; count: number }[]; progress: StudyProgress[]; entitlements: Entitlement[]; hasSubscription: boolean; readableTrainingIds: string[] }
export interface PurchaseOrder { id: string; title: string; kind: string; amountRial: number; status: string; provider: string; reference: string | null; createdAt: string }
export interface StudyData { document: StudyDocument; sections: { title: string; startPage: number }[]; notes: StudyNote[]; progress: StudyProgress | null; watermark: string }
export interface ExamQuestion { id: string; subject: string; topic: string; topicId?: string; sourceSectionId?: string; figureSvg?: string; difficulty: 'easy' | 'medium' | 'hard'; text: string; options: string[] }
export interface ExamAttempt { id: string; kind: string; expiresAt: string; questions: ExamQuestion[] }
export interface ExamOutcome { result: DiagnosticResult; analysis: AIAnalysis; review: { id: string; topic: string; correctAnswer: number; explanation: string }[] }
export interface Curriculum { courses: { code: string; title: string; trainingId: string }[]; chapters: { id: string; title: string; courseCode: string }[]; topics: { id: string; chapterId: string; courseCode: string; title: string; questionCount: number }[]; documents: StudyDocument[] }
export interface MasteryTopic { id: string; chapterId: string; title: string; evidenceQuestions: number; availableQuestions: number; accuracyPercentage: number | null; masteryPercentage: number | null; status: string }
export interface MasteryReport { courses: { code: string; title: string; totalTopics: number; assessedTopics: number; coveragePercentage: number; confirmedProgressPercentage: number; assessedAccuracyPercentage: number | null; topics: MasteryTopic[] }[] }
export interface SourceSection { id: string; topicId: string | null; heading: string; sortOrder: number; text: string }
export interface AuthSession { token: string; expiresAt: string; user: SessionUser }
export interface GoogleAuthStart { authorizationUrl: string; state: string; codeVerifier: string; expiresAt: string }
export type GoogleAuthComplete = { state: string; codeVerifier: string } & ({ code: string; error?: never } | { error: string; code?: never })

export const centApiBase = (import.meta.env.VITE_CENT_API_URL || '/api/cent/v1').replace(/\/$/, '')
const tokenKey = 'cent:session:v1'
const expiryKey = 'cent:session-expiry:v1'
function readSession(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}
export const session = {
  get: () => {
    const expiresAt = readSession(expiryKey)
    if (expiresAt && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now())) {
      session.clear()
      return null
    }
    return readSession(tokenKey)
  },
  expiresAt: () => readSession(expiryKey),
  set: (token: string, expiresAt?: string) => {
    if (expiresAt !== undefined && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now())) {
      throw new Error('مهلت ورود پایان یافته است؛ دوباره وارد شوید.')
    }
    try {
      if (expiresAt) sessionStorage.setItem(expiryKey, expiresAt)
      else sessionStorage.removeItem(expiryKey)
      sessionStorage.setItem(tokenKey, token)
    } catch (error) { session.clear(); throw error }
  },
  clear: () => {
    try { sessionStorage.removeItem(tokenKey); sessionStorage.removeItem(expiryKey) } catch { /* Storage may be blocked by the browser. */ }
  },
}
export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string, public retryAfterMs?: number) { super(message) }
}
export async function centRequest<T>(path: string, init: RequestInit = {}, retry = 0): Promise<T> {
  const token = session.get()
  const headers = new Headers(init.headers)
  if (!(init.body instanceof Blob)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(centApiBase + path, { ...init, headers, cache: 'no-store', credentials: 'omit' })
  if (!response.ok) {
    if ((!init.method || init.method === 'GET') && [429, 503].includes(response.status) && retry < 2 && !init.signal?.aborted) {
      const delay = Math.min(5, Number(response.headers.get('Retry-After')) || 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      if (session.get() === token) return centRequest<T>(path, init, retry + 1)
    }
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 && token && session.get() === token && !path.startsWith('/auth/')) window.dispatchEvent(new Event('cent:session-expired'))
    const retryAfter = response.headers.get('Retry-After')
    const retryAfterMs = retryAfter === null ? undefined : /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Math.max(0, Date.parse(retryAfter) - Date.now())
    throw new ApiError(payload.message || (response.status === 429 ? 'درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.' : 'ارتباط با سرویس برقرار نشد.'), response.status, payload.code, Number.isFinite(retryAfterMs) ? retryAfterMs : undefined)
  }
  if (response.status === 204) return undefined as T
  if (response.headers.get('Content-Type')?.startsWith('image/')) return await response.blob() as T
  return response.json() as Promise<T>
}
const post = <T>(path: string, body: unknown) => centRequest<T>(path, { method: 'POST', body: JSON.stringify(body) })
async function loadCurriculum(): Promise<Curriculum> {
  const data = await centRequest<Curriculum>('/curriculum')
  if (!data || ![data.courses, data.chapters, data.topics, data.documents].every(Array.isArray)) {
    throw new ApiError('فهرست درس‌ها موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.', 503, 'curriculum_unavailable')
  }
  return data
}
export const cent = {
  authenticate: (mode: 'login' | 'register', input: { email: string; password: string; name?: string }) => post<AuthSession>(`/auth/${mode}`, input),
  googleStart: () => post<GoogleAuthStart>('/auth/google/start', {}),
  googleComplete: (input: GoogleAuthComplete) => post<AuthSession>('/auth/google/complete', input),
  me: () => centRequest<SessionUser>('/me'),
  logout: () => post<void>('/auth/logout', {}),
  catalog: () => centRequest<{ trainings: Training[]; products: StoreProduct[] }>('/catalog'),
  status: () => centRequest<{ payments: string }>('/status'),
  library: () => centRequest<Library>('/me/library'),
  orders: () => centRequest<PurchaseOrder[]>('/me/orders'),
  notes: () => centRequest<StudyNote[]>('/me/notes'),
  document: (id: string) => centRequest<StudyData>(`/documents/${id}`),
  sourceSections: (id: string) => centRequest<SourceSection[]>(`/documents/${id}/source-sections`),
  curriculum: loadCurriculum,
  mastery: () => centRequest<MasteryReport>('/me/mastery'),
  page: (id: string, page: number, signal: AbortSignal) => centRequest<Blob>(`/documents/${id}/pages/${page}`, { signal }),
  saveNote: (note: Pick<StudyNote, 'id' | 'documentId' | 'page' | 'anchorY' | 'body' | 'revision'>) => centRequest<StudyNote>(`/notes/${note.id}`, { method: 'PUT', body: JSON.stringify(note) }),
  deleteNote: (note: StudyNote) => centRequest<void>(`/notes/${note.id}?revision=${note.revision}`, { method: 'DELETE' }),
  progress: (id: string, page: number) => centRequest<StudyProgress>(`/documents/${id}/progress`, { method: 'PUT', body: JSON.stringify({ page }) }),
  checkout: (productId: string, requestId: string) => post<{ id: string; redirectUrl: string }>('/checkout', { productId, requestId }),
  verify: (id: string) => post<{ paid: boolean }>(`/me/orders/${id}/verify`, {}),
  startExam: (kind: string, requestId: string, course?: string, topicId?: string) => post<ExamAttempt>('/attempts/', { kind, requestId, course, topicId }),
  submitExam: (id: string, answers: Record<string, number | null>) => post<ExamOutcome>(`/attempts/${id}/submit`, { answers }),
  outcome: (id: string) => centRequest<ExamOutcome>(`/attempts/${id}`),
  attempts: () => centRequest<{ id: string; kind: string; createdAt: string; resultJson: string }[]>('/attempts/'),
}
export const toman = (rial: number) => `${new Intl.NumberFormat('fa-IR').format(rial / 10)} تومان`
export const dateFa = (value: string) => new Date(value).toLocaleDateString('fa-IR')
