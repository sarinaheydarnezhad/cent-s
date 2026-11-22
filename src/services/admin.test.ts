import { describe, expect, it, vi, afterEach } from 'vitest'
import { admin, adminPermission, isAdminRole, permissionLabel, roleLabel, statusLabel } from './admin'

afterEach(() => vi.unstubAllGlobals())
describe('administrative boundaries and contracts', () => {
  it('recognizes only existing administrative roles', () => {
    for (const role of ['ADMIN','SuperAdmin','UserManager','ContentManager','ExamManager','FinanceManager']) expect(isAdminRole(role)).toBe(true)
    for (const role of ['STUDENT','admin','root','',undefined]) expect(isAdminRole(role)).toBe(false)
  })
  it('maps every administrative module to its permission', () => {
    for (const [path, permission] of [['users','users'],['resources','content'],['content','content'],['assessments','exams'],['questions','exams'],['orders','finance'],['subscriptions','finance'],['packages','finance'],['reports','roles'],['roles','roles'],['settings','settings']]) expect(adminPermission(`/admin/${path}`)).toBe(permission)
    expect(adminPermission('/admin')).toBe('overview')
  })
  it('keeps role, status and permission labels Persian', () => {
    expect(roleLabel('FinanceManager')).toBe('مدیر مالی'); expect(roleLabel('ADMIN')).toBe(roleLabel('SuperAdmin'))
    expect(statusLabel('PAID')).toBe('تأییدشده'); expect(permissionLabel('roles')).toContain('نقش')
  })
  it('encodes search and pagination without interpolating raw search text', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], total: 0, page: 2, pageSize: 20 })))
    vi.stubGlobal('fetch', fetcher)
    await admin.list('users',2,'a&b@example.invalid','UserManager')
    const url = fetcher.mock.calls[0][0] as string
    expect(url).toContain('page=2'); expect(url).toContain('search=a%26b%40example.invalid'); expect(url).toContain('role=UserManager')
  })
})
