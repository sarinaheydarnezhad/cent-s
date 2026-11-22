import { centRequest } from './cent'

export const adminRoles = ['ADMIN', 'SuperAdmin', 'UserManager', 'ContentManager', 'ExamManager', 'FinanceManager'] as const
export function isAdminRole(role?: string) { return adminRoles.some(r => r === role) }
export type Permission = 'overview' | 'users' | 'content' | 'exams' | 'finance' | 'roles' | 'settings'
export interface AdminAccess { role: string; permissions: Permission[] }
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number }
export interface AdminUser { id: string; name: string; email: string; role: string; createdAt: string; verifiedIdentity: boolean }
export interface AdminOrder { id: string; title: string; kind: string; amountRial: number; status: string; provider: string; reference: string | null; createdAt: string; paidAt: string | null; userEmail: string }
export interface AdminResource { id: string; title: string; trainingId: string; pageCount: number; published: boolean; sourceId: string | null }
export interface AdminSubscription { id: string; userId: string; orderId: string; startsAt: string; expiresAt: string | null; revokedAt: string | null; title: string; userEmail: string }
export interface AdminQuestion { id: string; subject: string; topic: string; topicId: string | null; difficulty: 'easy' | 'medium' | 'hard'; text: string; optionsJson: string; correctAnswer: number; explanation: string; kind: 'both' | 'diagnostic' | 'simulator'; active: boolean; managedByRelease: boolean }
export interface AdminAssessment { id: string; configurationRevision: string; status: string; availableForNewStarts: boolean; syllabusRevisionId: string | null; contentReleaseId: string | null; revision: number }
export interface AdminOverview { asOf: string; users: number; resources: number; publishedResources: number; availableAssessments: number; submittedAttempts: number; finance: null | { orders: number; paid: number; pending: number; incomeRial: number; activeSubscriptions: number } }
export interface AdminReport { start: string; end: string; days: number; registrations: { year: number; month: number; day: number; count: number }[]; orders: { status: string; count: number }[]; attempts: { kind: string; started: number; submitted: number }[] }
export const roleLabel = (role: string) => ({ ADMIN: 'مدیر ارشد', SuperAdmin: 'مدیر ارشد', UserManager: 'مدیر کاربران', ContentManager: 'مدیر محتوا', ExamManager: 'مدیر آزمون', FinanceManager: 'مدیر مالی', STUDENT: 'دانشجو' }[role] || 'نقش ناشناخته')
export const statusLabel = (status: string) => ({ PAID: 'تأییدشده', PENDING: 'در انتظار', FAILED: 'ناموفق', CANCELLED: 'لغوشده', DRAFT: 'پیش‌نویس', PUBLISHED: 'منتشرشده', ARCHIVED: 'بایگانی' }[status] || 'نامشخص')
export const permissionLabel = (permission: string) => ({ overview: 'نمای کلی', users: 'کاربران', content: 'محتوا و منابع', exams: 'آزمون‌ها', finance: 'مالی', roles: 'نقش‌ها و گزارش‌ها', settings: 'تنظیمات' }[permission] || permission)
export function adminPermission(path: string): Permission {
  if (/^\/admin\/(users)(\/|$)/.test(path)) return 'users'
  if (/^\/admin\/(resources|content|subjects)(\/|$)/.test(path)) return 'content'
  if (/^\/admin\/(assessments|questions|diagnostics|simulators)(\/|$)/.test(path)) return 'exams'
  if (/^\/admin\/(orders|finance|subscriptions|packages)(\/|$)/.test(path)) return 'finance'
  if (/^\/admin\/(roles|reports|audit)(\/|$)/.test(path)) return 'roles'
  if (/^\/admin\/settings(\/|$)/.test(path)) return 'settings'
  return 'overview'
}
export const admin = {
  access: () => centRequest<AdminAccess>('/admin/access'),
  overview: () => centRequest<AdminOverview>('/admin/overview'),
  list: <T,>(path: string, page: number, search: string, status: string) => centRequest<Paged<T>>(`/admin/${path}?${new URLSearchParams({ page: String(page), size: '20', search, status, ...(path === 'users' ? { role: status } : {}) })}`),
  detail: <T,>(path: string, id: string) => centRequest<T>(`/admin/${path}/${encodeURIComponent(id)}`),
  reports: (days: number) => centRequest<AdminReport>(`/admin/reports?days=${days}`),
}
