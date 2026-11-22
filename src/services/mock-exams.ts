import { ApiError, centRequest } from './cent'

export interface MockSection { sectionId: string; sectionKey: string; order: number; subjectId: string; questionCount: number; durationSeconds: number; state: string; deadline: string | null }
export interface MockState { attemptId: string; examVersionId: string; configurationRevision: string; revision: number; status: string; serverNow: string; activeSectionId: string | null; activeSection: MockSection | null; sections: MockSection[]; effectiveEndedAt?: string; finalizationReason?: string }
export interface MockVersion { examVersionId: string; label: string; totalQuestions: number; totalDurationSeconds: number; availableForNewStarts: boolean; availabilityReason: string | null }
export interface MockConfiguration extends MockVersion { configurationRevision: string; sections: { sectionKey: string; order: number; subjectId: string; questionCount: number; durationSeconds: number }[]; scoring: { correct: string; incorrect: string; unanswered: string } }
export interface MockQuestion { questionId: string; position: number; stem: string; options: { id: string; text: string }[]; passageSnapshotId: string | null; selectedOptionId: string | null; media?: string | null }
export interface MockContent { attemptId: string; revision: number; serverNow: string; sectionId: string | null; activeSection: MockState | null; passages: { passageSnapshotId: string; text: string; media?: string | null }[]; questions: MockQuestion[] }
export interface MockCounts { questionCount: number; correctCount: number; incorrectCount: number; unansweredCount: number; answeredCount: number; rawScore: string | null; maximumRawScore: string; accuracy: { displayPercent: string | null }; completionRate: { displayPercent: string | null } }
export interface MockResult extends MockCounts { attemptId: string; examVersionId: string; status: string; effectiveEndedAt: string; sections: { sectionId: string; subjectId: string; counts: MockCounts }[] }
export interface MockReview { passages: { passageRevisionId: string; text: string; media?: string | null }[]; questions: { questionId: string; position: number; sectionSubjectId: string; stem: string; options: { id: string; text: string }[]; passageRevisionId: string | null; selectedOptionId: string | null; correctOptionId: string; explanation: string; media?: string | null }[] }
export interface MockCommand { commandId: string; sectionId: string; expectedRevision: number; questionId?: string; selectedOptionId?: string | null; confirmForfeitRemainingTime?: boolean }
export type PendingCommand = { action: 'answer' | 'advance' | 'complete'; input: MockCommand }
export interface MockAcknowledgment { receipt: { accepted: boolean; commandId: string; appliedRevision: number }; currentState: MockState }
const root = '/assessment/mock-attempts'
const request = <T>(path: string, init: RequestInit = {}) => centRequest<T>(path, { ...init, signal: AbortSignal.timeout(15000) })
export const mockStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
}
export const mockExams = {
  versions: () => request<{ versions: MockVersion[] }>('/assessment/exam-versions'),
  configuration: (id: string) => request<MockConfiguration>(`/assessment/exam-versions/${encodeURIComponent(id)}/configuration`),
  start: (input: { requestId: string; examVersionId: string; configurationRevision: string }) => request<MockState>(root + '/', { method: 'POST', body: JSON.stringify(input) }),
  state: (id: string) => request<MockState>(`${root}/${id}`),
  content: (id: string) => request<MockContent>(`${root}/${id}/active-section`),
  command: (id: string, command: PendingCommand) => request<MockAcknowledgment>(`${root}/${id}/${command.action === 'answer' ? 'answers' : command.action}`, { method: command.action === 'answer' ? 'PUT' : 'POST', body: JSON.stringify(command.input) }),
  result: (id: string) => request<MockResult>(`${root}/${id}/result`),
  review: (id: string) => request<MockReview>(`${root}/${id}/review`),
  history: (cursor?: string) => request<{ items: MockState[]; nextCursor: string | null }>(`${root}/?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`),
}
export const mockSubjects: Record<string, string> = { reading: 'درک مطلب', math: 'ریاضی', logic: 'استدلال بر متن و داده', biology: 'زیست‌شناسی', chemistry: 'شیمی', physics: 'فیزیک' }
export const terminalMock = (state: MockState) => ['COMPLETED', 'EXPIRED'].includes(state.status)
export function mockRemaining(state: MockState, elapsedMilliseconds: number): number {
  if (!state.activeSection?.deadline) return 0
  const interval = Date.parse(state.activeSection.deadline) - Date.parse(state.serverNow) - Math.max(0, elapsedMilliseconds)
  return Number.isFinite(interval) ? Math.max(0, Math.ceil(interval / 1000)) : 0
}

// Only one unacknowledged command is allowed. Its exact identity and payload survive
// closure/reload; uncertain writes are retried verbatim against server receipts.
export class MockSession {
  private listeners = new Set<() => void>()
  private working = false
  private anchor = 0
  private storageKey: string
  private value: { state: MockState | null; content: MockContent | null; pending: PendingCommand | null; busy: boolean; error: string; acknowledgment: string } = { state: null, content: null, pending: null, busy: false, error: '', acknowledgment: '' }
  constructor(owner: string, private id: string, private storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, private api = mockExams, private now = () => performance.now()) {
    this.storageKey = `cent:mock-command:${owner}:${id}`
    try {
      const saved = JSON.parse(storage.getItem(this.storageKey) || 'null')
      if (saved?.input?.commandId && ['answer', 'advance', 'complete'].includes(saved.action)) this.value.pending = saved
    } catch { this.value.error = 'بازیابی ذخیره محلی ممکن نشد؛ پاسخ‌های تأییدشده از سرور دریافت می‌شوند.' }
  }
  snapshot = () => this.value
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private update(patch: Partial<typeof this.value>) { this.value = { ...this.value, ...patch }; this.listeners.forEach(l => l()) }
  remaining() { return this.value.state ? mockRemaining(this.value.state, this.now() - this.anchor) : 0 }
  private accept(state: MockState, content: MockContent | null = null) {
    this.anchor = this.now()
    this.update({ state, content })
  }
  private async read() {
    let state = await this.api.state(this.id)
    if (terminalMock(state)) { this.accept(state); return }
    const content = await this.api.content(this.id)
    // active-section is an atomic projection of the latest server state. Another
    // tab or the deadline worker can advance between the two GET requests.
    if (content.activeSection) state = content.activeSection
    else if (!content.sectionId) { this.accept(await this.api.state(this.id)); return }
    if (state.attemptId !== this.id || content.attemptId !== this.id || content.sectionId !== state.activeSectionId || content.revision !== state.revision) throw new Error('وضعیت بخش تغییر کرد؛ دوباره همگام‌سازی کنید.')
    this.accept(state, content)
  }
  async refresh() {
    if (this.working) return
    this.working = true; this.update({ busy: true })
    try { await this.read(); this.update({ error: '' }) }
    catch (e) { this.update({ error: e instanceof ApiError && e.status === 404 ? 'این تلاش در حساب فعلی پیدا نشد. از تاریخچه حساب خود ادامه دهید.' : 'ارتباط با سرور برقرار نشد. زمان آزمون ادامه دارد؛ برای دریافت وضعیت تلاش مجدد کنید.' }) }
    finally { this.working = false; this.update({ busy: false }) }
  }
  async send(action: PendingCommand['action'], questionId?: string, selectedOptionId?: string | null) {
    const state = this.value.state
    if (this.working || this.value.pending || !state?.activeSectionId || terminalMock(state) || this.remaining() === 0) return
    const pending: PendingCommand = { action, input: { commandId: crypto.randomUUID(), sectionId: state.activeSectionId, expectedRevision: state.revision,
      ...(action === 'answer' ? { questionId, selectedOptionId: selectedOptionId ?? null } : { confirmForfeitRemainingTime: true }) } }
    try { this.storage.setItem(this.storageKey, JSON.stringify(pending)) }
    catch { this.update({ error: 'ذخیره امن درخواست در این مرورگر ممکن نیست. دسترسی ذخیره محلی را فعال و دوباره تلاش کنید.' }); return }
    this.update({ pending, acknowledgment: '', error: '' })
    await this.retry()
  }
  async retry() {
    const pending = this.value.pending
    if (!pending || this.working) return
    this.working = true; this.update({ busy: true, error: '' })
    try {
      const response = await this.api.command(this.id, pending)
      if (!response.receipt.accepted || response.receipt.commandId !== pending.input.commandId) throw new Error('Invalid receipt')
      this.storage.removeItem(this.storageKey)
      this.accept(response.currentState)
      this.update({ pending: null, acknowledgment: pending.action === 'answer' ? 'پاسخ در سرور ذخیره شد.' : 'بخش با تأیید سرور بسته شد.' })
      try { await this.read() } catch { this.update({ error: 'درخواست ثبت شد؛ دریافت وضعیت تازه ممکن نشد. دوباره همگام‌سازی کنید.' }) }
    } catch (e) {
      if (e instanceof ApiError && [400, 404, 409].includes(e.status)) {
        this.storage.removeItem(this.storageKey); this.update({ pending: null, error: 'این درخواست پذیرفته نشد؛ وضعیت سرور را بررسی و در بخش فعال دوباره انتخاب کنید.' })
        try { await this.read() } catch { /* Keep the rejection visible and allow recovery. */ }
      } else this.update({ error: 'تأیید ذخیره دریافت نشد. درخواست حفظ شده است؛ «تلاش مجدد برای ثبت» را بزنید. زمان سرور ادامه دارد.' })
    } finally { this.working = false; this.update({ busy: false }) }
  }
}

export function mockStartIdentity(owner: string, configuration: MockConfiguration, storage: Pick<Storage, 'getItem' | 'setItem'>) {
  const key = `cent:mock-start:${owner}:${configuration.examVersionId}:${configuration.configurationRevision}`
  let requestId = storage.getItem(key)
  if (!requestId) { requestId = crypto.randomUUID(); storage.setItem(key, requestId) }
  return { key, input: { requestId, examVersionId: configuration.examVersionId, configurationRevision: configuration.configurationRevision } }
}
